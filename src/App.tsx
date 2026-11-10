import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Project,
  Task,
  CalendarEvent,
  ScheduledSession,
  AppSettings,
  Subtask,
} from './types';
import { loadDayframeState, saveDayframeState, resetToSampleData, exportDayframeData } from './utils/storage';
import { formatDateKey, formatReadableDate, isPastDateTime, timeToMinutes } from './utils/dateUtils';
import {
  autoScheduleTasks,
  rollRescheduleIncompletePastSessions,
  pullScheduleForwardOnEarlyCompletion,
} from './utils/scheduler';
import { playStepCompleteSound, playTaskCompleteFanfare } from './utils/sound';

import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { Timeline, TimelineItem } from './components/Timeline';
import { AutoScheduleModal } from './components/AutoScheduleModal';
import { TaskBreakdownModal } from './components/TaskBreakdownModal';
import { FocusMode } from './components/FocusMode';
import { TaskCompleteModal } from './components/TaskCompleteModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateEventModal } from './components/CreateEventModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ProjectsView } from './components/ProjectsView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { YourSpaceView } from './components/YourSpaceView';
import { DatePickerModal } from './components/DatePickerModal';

export default function App() {
  const [state, setState] = useState(() => loadDayframeState());

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Modals state
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskProjectId, setCreateTaskProjectId] = useState<string | undefined>(undefined);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);

  const [activeTaskIdForBreakdown, setActiveTaskIdForBreakdown] = useState<string | null>(null);
  const [activeProjectIdForDetail, setActiveProjectIdForDetail] = useState<string | null>(null);

  // Focus Mode state
  const [activeFocus, setActiveFocus] = useState<{
    taskId: string;
    subtaskId: string;
  } | null>(null);

  // Main-task completion transition
  const [taskCompleteData, setTaskCompleteData] = useState<{
    completedTask: Task;
    nextTask: Task | null;
    nextSubtask: Subtask | null;
  } | null>(null);

  // Persist state on change
  useEffect(() => {
    saveDayframeState(state);
  }, [state]);

  // Sync theme with document element
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  // Rolling automatic schedule check on mount & periodically
  useEffect(() => {
    const checkRollingSchedule = () => {
      setState((prev) => {
        const updatedSessions = rollRescheduleIncompletePastSessions(
          prev.tasks,
          prev.sessions,
          prev.events,
          prev.settings
        );
        if (updatedSessions !== prev.sessions) {
          return { ...prev, sessions: updatedSessions };
        }
        return prev;
      });
    };

    checkRollingSchedule();
    const interval = setInterval(checkRollingSchedule, 60000);
    const onReturn = () => { if (document.visibilityState === 'visible') checkRollingSchedule(); };
    window.addEventListener('focus', onReturn);
    document.addEventListener('visibilitychange', onReturn);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onReturn);
      document.removeEventListener('visibilitychange', onReturn);
    };
  }, [state.settings.scheduling.autoRolling]);

  // Find all scheduled dates for date picker
  const scheduledDates = useMemo(() => {
    const dates = new Set<string>();
    state.sessions.forEach((s) => dates.add(s.date));
    state.events.forEach((e) => dates.add(e.date));
    return Array.from(dates);
  }, [state.sessions, state.events]);

  // Task map & Project map
  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    state.tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [state.tasks]);

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    state.projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [state.projects]);

  // Identify next focus item overall (for Today or selected date)
  const nextFocusSession = useMemo(() => {
    // 1. Look for incomplete session on selected date
    const daySessions = state.sessions
      .filter((s) => s.date === selectedDate && !s.isCompleted)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (daySessions.length > 0) return daySessions[0];

    // 2. If viewing today and nothing today, find earliest incomplete session in future
    const allIncomplete = state.sessions
      .filter((s) => !s.isCompleted)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

    return allIncomplete[0] || null;
  }, [state.sessions, selectedDate]);

  // Timeline items for selected date
  const timelineItems = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];

    // Add scheduled subtask sessions for this date
    const daySessions = state.sessions.filter((s) => s.date === selectedDate && !s.isCompleted);
    for (const session of daySessions) {
      const task = taskMap.get(session.taskId);
      const subtask = task?.subtasks.find((st) => st.id === session.subtaskId);
      const project = task?.projectId ? projectMap.get(task.projectId) : undefined;
      const isActiveFocus = nextFocusSession?.id === session.id;

      list.push({
        id: session.id,
        type: 'session',
        startTime: session.startTime,
        endTime: session.endTime,
        title: subtask?.title || 'Scheduled step',
        durationMinutes: session.durationMinutes,
        session,
        task,
        project,
        isCompleted: session.isCompleted || (subtask ? subtask.completed : false),
        isActiveFocus,
      });
    }

    // Add calendar events for this date
    const dayEvents = state.events.filter((e) => e.date === selectedDate);
    for (const event of dayEvents) {
      const startMin = timeToMinutes(event.startTime);
      const endMin = timeToMinutes(event.endTime);
      const duration = Math.max(15, endMin - startMin);

      list.push({
        id: event.id,
        type: 'event',
        startTime: event.startTime,
        endTime: event.endTime,
        title: event.title,
        durationMinutes: duration,
        event,
        isCompleted: false,
      });
    }

    // Sort chronologically by start time
    return list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [state.sessions, state.events, selectedDate, taskMap, projectMap, nextFocusSession]);

  // Active Next Focus item for CTA
  const nextFocusTimelineItem = useMemo(() => {
    return timelineItems.find((item) => item.isActiveFocus) || null;
  }, [timelineItems]);

  // Progress metrics for selected date
  const { completedCount, totalCount, remainingMinutes } = useMemo(() => {
    const daySessions = state.sessions.filter((s) => s.date === selectedDate);
    let completed = 0;
    let remaining = 0;

    for (const s of daySessions) {
      if (s.isCompleted) {
        completed++;
      } else {
        remaining += s.durationMinutes || 0;
      }
    }

    return {
      completedCount: completed,
      totalCount: daySessions.length,
      remainingMinutes: remaining,
    };
  }, [state.sessions, selectedDate]);

  // Handlers
  const handleToggleSessionComplete = useCallback(
    (session: ScheduledSession) => {
      const nextCompleted = !session.isCompleted;

      // Update session
      const updatedSessions = state.sessions.map((s) =>
        s.id === session.id
          ? {
              ...s,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            }
          : s
      );

      // Update matching subtask in task
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === session.taskId) {
          const updatedSub = t.subtasks.map((sub) =>
            sub.id === session.subtaskId
              ? {
                  ...sub,
                  completed: nextCompleted,
                  completedAt: nextCompleted ? new Date().toISOString() : undefined,
                }
              : sub
          );
          const allDone = updatedSub.length > 0 && updatedSub.every((st) => st.completed);
          return {
            ...t,
            subtasks: updatedSub,
            completed: allDone,
            completedAt: allDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });

      if (nextCompleted && state.settings.focus.soundEnabled) {
        playStepCompleteSound();
      }

      // Early completion pull forward if completed
      if (nextCompleted) {
        const pulledSessions = pullScheduleForwardOnEarlyCompletion(
          updatedTasks,
          updatedSessions,
          state.events,
          state.settings,
          session.subtaskId
        );
        setState((prev) => ({
          ...prev,
          tasks: updatedTasks,
          sessions: pulledSessions,
        }));
      } else {
        const rescheduled = autoScheduleTasks(
          updatedTasks,
          updatedSessions,
          state.events,
          state.settings,
          formatDateKey(new Date())
        );
        setState((prev) => ({
          ...prev,
          tasks: updatedTasks,
          sessions: rescheduled.sessions,
        }));
      }
    },
    [state.sessions, state.tasks, state.events, state.settings]
  );

  const handleStartFocus = useCallback(
    (taskId: string, subtaskId: string) => {
      setActiveFocus({ taskId, subtaskId });
    },
    []
  );

  const handleCompleteSubtaskInFocus = useCallback(
    (taskId: string, subtaskId: string) => {
      const task = taskMap.get(taskId);
      if (!task) return;

      const completedSubtask = task.subtasks.find((s) => s.id === subtaskId);
      if (!completedSubtask) return;

      // Update subtasks
      const updatedSubtasks = task.subtasks.map((s) =>
        s.id === subtaskId
          ? { ...s, completed: true, completedAt: new Date().toISOString() }
          : s
      );

      const isTaskComplete = updatedSubtasks.every((s) => s.completed);

      const updatedTask: Task = {
        ...task,
        subtasks: updatedSubtasks,
        completed: isTaskComplete,
        completedAt: isTaskComplete ? new Date().toISOString() : undefined,
      };

      const updatedTasks = state.tasks.map((t) => (t.id === taskId ? updatedTask : t));

      // Mark matching session complete
      const updatedSessions = state.sessions.map((s) =>
        s.subtaskId === subtaskId
          ? { ...s, isCompleted: true, completedAt: new Date().toISOString() }
          : s
      );

      // Re-align schedule with pull-forward
      const finalSessions = pullScheduleForwardOnEarlyCompletion(
        updatedTasks,
        updatedSessions,
        state.events,
        state.settings,
        subtaskId
      );

      setState((prev) => ({
        ...prev,
        tasks: updatedTasks,
        sessions: finalSessions,
      }));

      // Sound feedback
      if (state.settings.focus.soundEnabled) {
        if (isTaskComplete) {
          playTaskCompleteFanfare();
        } else {
          playStepCompleteSound();
        }
      }

      // Check task complete vs step complete transition
      if (isTaskComplete) {
        // Continue with the next task in the actual schedule, not simply the
        // next task in the order it happens to appear in the projects array.
        const nextScheduledSession = finalSessions
          .filter((session) => !session.isCompleted && session.taskId !== taskId)
          .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))[0];
        const nextIncompleteTask = nextScheduledSession
          ? updatedTasks.find((t) => t.id === nextScheduledSession.taskId && !t.completed) || null
          : updatedTasks.find((t) => !t.completed && t.id !== taskId) || null;
        const nextIncompleteSubtask = nextScheduledSession
          ? nextIncompleteTask?.subtasks.find((s) => s.id === nextScheduledSession.subtaskId && !s.completed) || null
          : nextIncompleteTask?.subtasks.filter((s) => !s.completed).sort((a, b) => a.order - b.order)[0] || null;

        setActiveFocus(null);
        setTaskCompleteData({
          completedTask: updatedTask,
          nextTask: nextIncompleteTask,
          nextSubtask: nextIncompleteSubtask,
        });
      } else {
        // Keep the user in Focus Mode and move straight to the next subtask.
        // The completed step remains recorded in the task's progress history.
        const nextSubtask = updatedSubtasks
          .filter((subtask) => !subtask.completed)
          .sort((a, b) => a.order - b.order)[0];
        if (nextSubtask) {
          setActiveFocus({ taskId, subtaskId: nextSubtask.id });
        }
      }
    },
    [taskMap, state.tasks, state.sessions, state.events, state.settings]
  );

  const handleSkipSubtaskInFocus = useCallback(
    (taskId: string, subtaskId: string) => {
      const task = taskMap.get(taskId);
      if (!task) return;

      const subtasks = [...task.subtasks].sort((a, b) => a.order - b.order);
      const currIdx = subtasks.findIndex((s) => s.id === subtaskId);
      const nextSub = subtasks.slice(currIdx + 1).find((subtask) => !subtask.completed);
      if (nextSub) setActiveFocus({ taskId, subtaskId: nextSub.id });
      else setActiveFocus(null);
    },
    [taskMap]
  );

  const handleSwitchSubtaskInFocus = useCallback(
    (taskId: string, subtaskId: string) => {
      setActiveFocus({ taskId, subtaskId });
    },
    []
  );

  const handleContinueToNextTask = useCallback(() => {
    if (!taskCompleteData || !taskCompleteData.nextTask || !taskCompleteData.nextSubtask) return;
    const { nextTask, nextSubtask } = taskCompleteData;
    setTaskCompleteData(null);
    setActiveFocus({ taskId: nextTask.id, subtaskId: nextSubtask.id });
  }, [taskCompleteData]);

  // Execute Auto Schedule
  const handleRunAutoSchedule = useCallback(() => {
    const result = autoScheduleTasks(
      state.tasks,
      state.sessions,
      state.events,
      state.settings,
      selectedDate < formatDateKey(new Date()) ? formatDateKey(new Date()) : selectedDate
    );

    setState((prev) => ({
      ...prev,
      sessions: result.sessions,
    }));

    return result;
  }, [state.tasks, state.sessions, state.events, state.settings, selectedDate]);

  // Task creation
  const handleCreateTask = useCallback((newTask: Task) => {
    setState((prev) => {
      const updatedTasks = [newTask, ...prev.tasks];
      // Run automatic scheduler to place newly created task into timeline
      const result = autoScheduleTasks(
        updatedTasks,
        prev.sessions,
        prev.events,
        prev.settings,
        formatDateKey(new Date())
      );
      return {
        ...prev,
        tasks: updatedTasks,
        sessions: result.sessions,
      };
    });
  }, []);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setState((prev) => {
      const updatedTasks = prev.tasks.map((task) => task.id === updatedTask.id ? updatedTask : task);
      const sessions = autoScheduleTasks(
        updatedTasks, prev.sessions, prev.events, prev.settings, formatDateKey(new Date())
      ).sessions;
      return { ...prev, tasks: updatedTasks, sessions };
    });
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setState((prev) => {
      const updatedTasks = prev.tasks.filter((task) => task.id !== taskId);
      const updatedSessions = prev.sessions.filter((session) => session.taskId !== taskId);
      const sessions = autoScheduleTasks(updatedTasks, updatedSessions, prev.events, prev.settings, formatDateKey(new Date())).sessions;
      return { ...prev, tasks: updatedTasks, sessions };
    });
    setActiveTaskIdForBreakdown(null);
  }, []);

  // Keep the rolling schedule in sync with changes to working hours or scheduling rules.
  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setState((prev) => {
      const schedulingChanged =
        JSON.stringify(prev.settings.workSchedule) !== JSON.stringify(newSettings.workSchedule) ||
        JSON.stringify(prev.settings.scheduling) !== JSON.stringify(newSettings.scheduling);
      const sessions = schedulingChanged
        ? autoScheduleTasks(prev.tasks, prev.sessions, prev.events, newSettings, formatDateKey(new Date())).sessions
        : prev.sessions;
      return { ...prev, settings: newSettings, sessions };
    });
  }, []);

  // Project management
  const handleCreateProject = useCallback((newProject: Project) => {
    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  }, []);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    }));
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
      tasks: prev.tasks.map((t) => (t.projectId === projectId ? { ...t, projectId: undefined } : t)),
    }));
    setActiveProjectIdForDetail(null);
  }, []);

  // Event management
  const handleSaveEvent = useCallback((event: CalendarEvent) => {
    setState((prev) => {
      const exists = prev.events.some((e) => e.id === event.id);
      const updatedEvents = exists
        ? prev.events.map((e) => (e.id === event.id ? event : e))
        : [...prev.events, event];

      // Re-schedule flexible tasks around this fixed event
      const scheduleRes = autoScheduleTasks(
        prev.tasks,
        prev.sessions,
        updatedEvents,
        prev.settings,
        formatDateKey(new Date())
      );

      return {
        ...prev,
        events: updatedEvents,
        sessions: scheduleRes.sessions,
      };
    });
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setState((prev) => {
      const events = prev.events.filter((event) => event.id !== eventId);
      const sessions = autoScheduleTasks(prev.tasks, prev.sessions, events, prev.settings, formatDateKey(new Date())).sessions;
      return { ...prev, events, sessions };
    });
    setEditingEvent(undefined);
  }, []);

  // Backup & Reset handlers
  const handleExportData = useCallback(() => {
    const dataStr = exportDayframeData(state);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayframe-backup-${formatDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleResetData = useCallback(() => {
    const fresh = resetToSampleData();
    setState(fresh);
    setSelectedDate(formatDateKey(new Date()));
  }, []);

  const handleClearData = useCallback(() => {
    const emptyState = {
      version: 1,
      projects: [],
      tasks: [],
      events: [],
      sessions: [],
      settings: state.settings,
      activeFocusSession: null,
    };
    saveDayframeState(emptyState);
    setState(emptyState);
  }, [state.settings]);

  // Selected task for breakdown
  const currentBreakdownTask = activeTaskIdForBreakdown
    ? taskMap.get(activeTaskIdForBreakdown) || null
    : null;
  const currentBreakdownProject = currentBreakdownTask?.projectId
    ? projectMap.get(currentBreakdownTask.projectId)
    : undefined;

  // Selected project for detail
  const currentDetailProject = activeProjectIdForDetail
    ? projectMap.get(activeProjectIdForDetail) || null
    : null;

  // Active focus task
  const activeFocusTask = activeFocus ? taskMap.get(activeFocus.taskId) : null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#171717] antialiased">
      <div className="max-w-lg mx-auto min-h-screen bg-white relative flex flex-col shadow-xl">
        {/* TAB 1: DAILY PLANNER */}
        {activeTab === 'today' && (
          <main className="flex-1 flex flex-col">
            <Header
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenDatePicker={() => setIsDatePickerOpen(true)}
              onOpenAutoSchedule={() => setIsAutoScheduleOpen(true)}
              onOpenCreateTask={() => {
                setCreateTaskProjectId(undefined);
                setIsCreateTaskOpen(true);
              }}
              completedStepsCount={completedCount}
              totalStepsCount={totalCount}
              remainingMinutes={remainingMinutes}
            />

            <Timeline
              items={timelineItems}
              nextFocusItem={nextFocusTimelineItem}
              onToggleComplete={handleToggleSessionComplete}
              onOpenTaskBreakdown={(taskId) => setActiveTaskIdForBreakdown(taskId)}
              onOpenEventModal={(event) => {
                setEditingEvent(event);
                setIsCreateEventOpen(true);
              }}
              onStartFocus={handleStartFocus}
              onOpenAutoSchedule={() => setIsAutoScheduleOpen(true)}
              onOpenCreateTask={() => {
                setCreateTaskProjectId(undefined);
                setIsCreateTaskOpen(true);
              }}
            />
          </main>
        )}

        {/* TAB 2: PROJECTS */}
        {activeTab === 'projects' && (
          <main className="flex-1 flex flex-col">
            <ProjectsView
              projects={state.projects}
              tasks={state.tasks}
              onSelectProject={(p) => setActiveProjectIdForDetail(p.id)}
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onOpenCreateTask={() => {
                setCreateTaskProjectId(undefined);
                setIsCreateTaskOpen(true);
              }}
            />
          </main>
        )}

        {/* TAB 3: YOUR SPACE */}
        {activeTab === 'space' && (
          <main className="flex-1 flex flex-col">
            <YourSpaceView
              settings={state.settings}
              onUpdateSettings={handleUpdateSettings}
              onExportData={handleExportData}
              onResetData={handleResetData}
              onClearData={handleClearData}
            />
          </main>
        )}

        {/* Fixed Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* SCREEN 2: AUTO SCHEDULE MODAL */}
        <AutoScheduleModal
          isOpen={isAutoScheduleOpen}
          onClose={() => setIsAutoScheduleOpen(false)}
          onRunAutoSchedule={handleRunAutoSchedule}
          settings={state.settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenWorkSchedule={() => {
            setActiveTab('space');
          }}
        />

        {/* SCREEN 3: TASK BREAKDOWN MODAL */}
        <TaskBreakdownModal
          task={currentBreakdownTask}
          project={currentBreakdownProject}
          isOpen={!!currentBreakdownTask}
          onClose={() => setActiveTaskIdForBreakdown(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onStartFocus={handleStartFocus}
        />

        {/* SCREEN 4 & 6: FOCUS MODE (DEDICATED FULL-SCREEN IMMERSION) */}
        {activeFocus && activeFocusTask && (
          <FocusMode
            task={activeFocusTask}
            currentSubtaskId={activeFocus.subtaskId}
            onClose={() => setActiveFocus(null)}
            onCompleteSubtask={handleCompleteSubtaskInFocus}
            onSkipSubtask={handleSkipSubtaskInFocus}
            onSwitchSubtask={handleSwitchSubtaskInFocus}
            soundEnabled={state.settings.focus.soundEnabled}
            tickSoundEnabled={state.settings.focus.tickSound}
          />
        )}

        {/* TASK COMPLETE MODAL (NEXT TASK PRESENTATION) */}
        <TaskCompleteModal
          completedTask={taskCompleteData?.completedTask || null}
          nextTask={taskCompleteData?.nextTask || null}
          nextSubtask={taskCompleteData?.nextSubtask || null}
          isOpen={!!taskCompleteData}
          onContinueToNextTask={handleContinueToNextTask}
          onReturnToPlanner={() => setTaskCompleteData(null)}
        />

        {/* UNIVERSAL TASK CREATION MODAL */}
        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          projects={state.projects}
          defaultProjectId={createTaskProjectId}
          defaultDate={selectedDate}
          onCreateTask={handleCreateTask}
        />

        {/* PROJECT DETAIL MODAL */}
        <ProjectDetailModal
          project={currentDetailProject}
          tasks={state.tasks}
          isOpen={!!currentDetailProject}
          onClose={() => setActiveProjectIdForDetail(null)}
          onSelectTask={(taskId) => {
            setActiveProjectIdForDetail(null);
            setActiveTaskIdForBreakdown(taskId);
          }}
          onOpenCreateTaskForProject={(projId) => {
            setCreateTaskProjectId(projId);
            setIsCreateTaskOpen(true);
          }}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
        />

        {/* CREATE PROJECT MODAL */}
        <CreateProjectModal
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onCreateProject={handleCreateProject}
        />

        {/* CREATE/EDIT EVENT MODAL */}
        <CreateEventModal
          isOpen={isCreateEventOpen}
          onClose={() => {
            setIsCreateEventOpen(false);
            setEditingEvent(undefined);
          }}
          event={editingEvent}
          defaultDate={selectedDate}
          projects={state.projects}
          onSaveEvent={handleSaveEvent}
          onDeleteEvent={handleDeleteEvent}
        />

        {/* DATE PICKER MODAL */}
        <DatePickerModal
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          scheduledDates={scheduledDates}
        />
      </div>
    </div>
  );
}
