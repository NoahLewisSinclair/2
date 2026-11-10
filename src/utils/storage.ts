import { Project, Task, CalendarEvent, ScheduledSession, AppSettings } from '../types';
import { createInitialSampleData } from './sampleData';

const STORAGE_KEY = 'dayframe_app_v1';

export interface DayframeState {
  version: number;
  projects: Project[];
  tasks: Task[];
  events: CalendarEvent[];
  sessions: ScheduledSession[];
  settings: AppSettings;
  activeFocusSession: {
    taskId: string;
    subtaskId: string;
    targetSeconds: number;
    remainingSeconds: number;
    isPaused: boolean;
    lastTickTimestamp: number;
  } | null;
}

export function loadDayframeState(): DayframeState {
  if (typeof window === 'undefined') {
    const initial = createInitialSampleData();
    return {
      version: 1,
      ...initial,
      activeFocusSession: null,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialSampleData();
      const state: DayframeState = {
        version: 1,
        ...initial,
        activeFocusSession: null,
      };
      saveDayframeState(state);
      return state;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tasks)) {
      const initial = createInitialSampleData();
      return {
        version: 1,
        ...initial,
        activeFocusSession: null,
      };
    }

    return parsed;
  } catch (err) {
    console.error('Error loading Dayframe state from localStorage:', err);
    const initial = createInitialSampleData();
    return {
      version: 1,
      ...initial,
      activeFocusSession: null,
    };
  }
}

export function saveDayframeState(state: DayframeState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving Dayframe state to localStorage:', err);
  }
}

export function exportDayframeData(state: DayframeState): string {
  return JSON.stringify(state, null, 2);
}

export function resetToSampleData(): DayframeState {
  const initial = createInitialSampleData();
  const state: DayframeState = {
    version: 1,
    ...initial,
    activeFocusSession: null,
  };
  saveDayframeState(state);
  return state;
}
