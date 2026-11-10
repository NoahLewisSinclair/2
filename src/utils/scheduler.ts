import { Task, CalendarEvent, ScheduledSession, AppSettings } from '../types';
import { formatDateKey, timeToMinutes, minutesToTime, addDays, getDayOfWeek } from './dateUtils';

interface Interval { start: number; end: number }
export interface SchedulingResult {
  sessions: ScheduledSession[];
  scheduledCount: number;
  daysCount: number;
  unscheduledSubtaskCount: number;
  message: string;
}

const priorityWeight = { high: 3, medium: 2, low: 1 } as const;
const makeSessionId = (taskId: string, subtaskId: string, date: string) => `session-${taskId}-${subtaskId}-${date}`;

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

function getWorkingHours(dateKey: string, settings: AppSettings) {
  const day = getDayOfWeek(dateKey);
  const config = settings.workSchedule.dayHours[day];
  if (!settings.workSchedule.workingDays.includes(day) || (config && !config.enabled)) return null;
  const start = timeToMinutes(config?.start || '09:00');
  const end = timeToMinutes(config?.end || '17:00');
  return end > start ? { start, end } : null;
}

function getBusyIntervals(dateKey: string, sessions: ScheduledSession[], events: CalendarEvent[], settings: AppSettings): Interval[] {
  const busy: Interval[] = [];
  for (const event of events) {
    if (event.date === dateKey) {
      const start = timeToMinutes(event.startTime);
      const end = timeToMinutes(event.endTime);
      if (end > start) busy.push({ start, end });
    }
  }
  const dayEvents = events.filter(e => e.date === dateKey);
  const lunch = settings.workSchedule.lunchBreak;
  if (lunch.enabled && !dayEvents.some(e => e.type === 'lunch')) {
    const start = timeToMinutes(lunch.start);
    const end = timeToMinutes(lunch.end);
    if (end > start) busy.push({ start, end });
  }
  for (const session of sessions) {
    if (session.date !== dateKey) continue;
    const start = timeToMinutes(session.startTime);
    const end = timeToMinutes(session.endTime);
    if (end > start) busy.push({ start, end });
  }
  return busy.sort((a, b) => a.start - b.start);
}

function findSlot(startAt: number, duration: number, workEnd: number, busy: Interval[], buffer: number): number | null {
  let candidate = startAt;
  for (const interval of busy) {
    if (interval.end <= candidate) continue;
    if (candidate + duration <= interval.start) return candidate;
    if (overlaps({ start: candidate, end: candidate + duration }, interval)) {
      candidate = interval.end + buffer;
    }
    if (candidate + duration > workEnd) return null;
  }
  return candidate + duration <= workEnd ? candidate : null;
}

/**
 * Rebuilds the flexible schedule from a chosen date. Completed and locked sessions
 * are immutable. Every active subtask is scheduled as one complete block; steps are
 * never silently shortened to fit a gap.
 */
export function autoScheduleTasks(
  tasks: Task[],
  existingSessions: ScheduledSession[],
  events: CalendarEvent[],
  settings: AppSettings,
  targetStartDateKey?: string
): SchedulingResult {
  const now = new Date();
  const todayKey = formatDateKey(now);
  const startKey = targetStartDateKey || todayKey;
  const preserve = existingSessions.filter(s => s.isCompleted || s.isLocked);
  const preservedSubtaskIds = new Set(preserve.map(s => s.subtaskId));

  const orderedTasks = tasks.filter(t => !t.completed).slice().sort((a, b) => {
    // Honour an explicitly chosen start date first; within that date, prioritise work.
    const aAvailable = a.preferredDate && a.preferredDate > startKey ? a.preferredDate : startKey;
    const bAvailable = b.preferredDate && b.preferredDate > startKey ? b.preferredDate : startKey;
    if (aAvailable !== bAvailable) return aAvailable.localeCompare(bAvailable);
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (priorityDiff) return priorityDiff;
    if (a.deadline && b.deadline && a.deadline !== b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const pending = orderedTasks.flatMap(task =>
    [...task.subtasks].sort((a, b) => a.order - b.order)
      .filter(sub => !sub.completed && !sub.isWaiting && !preservedSubtaskIds.has(sub.id))
      .map(sub => ({ task, sub }))
  );

  const result: ScheduledSession[] = [...preserve];
  const plannedDates = new Set<string>();
  const buffer = Math.max(0, settings.workSchedule.bufferMinutes || 0);
  let cursorDate = startKey;
  let scheduledCount = 0;
  let daysVisited = 0;
  // A generous safety horizon prevents ordinary workloads from being left unscheduled.
  const maxDays = 365; // Always roll work into future working days when today's capacity is full.
  let pendingIndex = 0;

  while (pendingIndex < pending.length && daysVisited < maxDays) {
    const working = getWorkingHours(cursorDate, settings);
    if (!working) {
      cursorDate = addDays(cursorDate, 1);
      daysVisited++;
      continue;
    }

    let earliest = working.start;
    if (cursorDate === todayKey && startKey <= todayKey) {
      const current = now.getHours() * 60 + now.getMinutes();
      earliest = Math.max(earliest, Math.ceil(current / 5) * 5);
    }

    const busy = getBusyIntervals(cursorDate, result, events, settings);
    let searchFrom = earliest;
    let placedOnDate = false;

    while (pendingIndex < pending.length) {
      const item = pending[pendingIndex];
      if (item.task.preferredDate && cursorDate < item.task.preferredDate) break;
      const duration = Math.max(1, Math.round(item.sub.durationMinutes || 15));
      const slot = findSlot(searchFrom, duration, working.end, busy, buffer);
      // Keep each task's steps in order. If the next step cannot fit, move it and
      // all subsequent work to a later working day rather than skipping ahead.
      if (slot === null) break;
      const end = slot + duration;
      const session: ScheduledSession = {
        id: makeSessionId(item.task.id, item.sub.id, cursorDate),
        taskId: item.task.id,
        subtaskId: item.sub.id,
        date: cursorDate,
        startTime: minutesToTime(slot),
        endTime: minutesToTime(end),
        durationMinutes: duration,
        isLocked: false,
        isCompleted: false,
      };
      result.push(session);
      busy.push({ start: slot, end: end + buffer });
      busy.sort((a, b) => a.start - b.start);
      pendingIndex++;
      scheduledCount++;
      placedOnDate = true;
      searchFrom = end + buffer;
    }

    if (placedOnDate) plannedDates.add(cursorDate);
    cursorDate = addDays(cursorDate, 1);
    daysVisited++;
  }

  result.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const unscheduledSubtaskCount = pending.length - scheduledCount;
  const daysCount = plannedDates.size;
  const message = unscheduledSubtaskCount
    ? `${scheduledCount} steps scheduled; ${unscheduledSubtaskCount} need more available working time.`
    : pending.length === 0
      ? 'Nothing new to schedule. Your work is up to date.'
      : `Work scheduled across ${daysCount} ${daysCount === 1 ? 'day' : 'days'}.`;
  return { sessions: result, scheduledCount, daysCount, unscheduledSubtaskCount, message };
}

/** Move overdue flexible work forward from the current time, without touching locked/completed work. */
export function rollRescheduleIncompletePastSessions(
  tasks: Task[], sessions: ScheduledSession[], events: CalendarEvent[], settings: AppSettings
): ScheduledSession[] {
  const now = new Date();
  const todayKey = formatDateKey(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const hasOverdue = sessions.some(s => {
    if (s.isCompleted || s.isLocked) return false;
    return s.date < todayKey || (s.date === todayKey && timeToMinutes(s.endTime) <= currentMinutes);
  });
  if (!hasOverdue) return sessions;
  return autoScheduleTasks(tasks, sessions, events, settings, todayKey).sessions;
}

/** Complete a subtask and immediately rebuild the remaining flexible schedule. */
export function pullScheduleForwardOnEarlyCompletion(
  tasks: Task[], sessions: ScheduledSession[], events: CalendarEvent[], settings: AppSettings, completedSubtaskId: string
): ScheduledSession[] {
  const nowIso = new Date().toISOString();
  const updated = sessions.map(s => s.subtaskId === completedSubtaskId
    ? { ...s, isCompleted: true, completedAt: nowIso }
    : s
  );
  return autoScheduleTasks(tasks, updated, events, settings, formatDateKey(new Date())).sessions;
}
