export type Priority = 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  completedAt?: string;
  order: number;
  isWaiting?: boolean;
}

export interface Task {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string; // 'YYYY-MM-DD'
  preferredDate?: string; // 'YYYY-MM-DD'
  estimatedMinutes?: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  subtasks: Subtask[];
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  color: string; // Hex color code
  deadline: string; // 'YYYY-MM-DD'
  createdAt: string;
}

export type EventType = 'meeting' | 'lunch' | 'break' | 'appointment' | 'blocked';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  description?: string;
  type: EventType;
  isRecurring?: boolean;
  projectId?: string;
}

export interface ScheduledSession {
  id: string;
  subtaskId: string;
  taskId: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  durationMinutes: number;
  isLocked: boolean;
  isCompleted: boolean;
  completedAt?: string;
}

export interface DayWorkingHours {
  start: string; // '09:00'
  end: string;   // '17:00'
  enabled: boolean;
}

export interface WorkSchedule {
  workingDays: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  dayHours: Record<number, DayWorkingHours>;
  lunchBreak: {
    enabled: boolean;
    start: string; // '12:00'
    end: string;   // '12:45'
    title: string;
  };
  bufferMinutes: number;
}

export interface SchedulingPreferences {
  prioritizeBy: 'priority-first' | 'deadline-first';
  multiDay: boolean;
  autoRolling: boolean;
}

export interface FocusPreferences {
  soundEnabled: boolean;
  autoNext: boolean;
  tickSound: boolean;
}

export interface AppSettings {
  workSchedule: WorkSchedule;
  scheduling: SchedulingPreferences;
  focus: FocusPreferences;
  theme: 'light' | 'dark' | 'system';
}

export interface ActiveFocusSession {
  taskId: string;
  subtaskId: string;
  startTime: number;
  pausedRemainingSeconds: number | null;
  isPaused: boolean;
  totalTargetSeconds: number;
}
