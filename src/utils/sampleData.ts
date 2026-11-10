import { Task, Project, CalendarEvent, ScheduledSession, AppSettings } from '../types';
import { formatDateKey, addDays } from './dateUtils';

export function createInitialSampleData(): {
  projects: Project[];
  tasks: Task[];
  events: CalendarEvent[];
  sessions: ScheduledSession[];
  settings: AppSettings;
} {
  const today = formatDateKey(new Date());
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);

  const projects: Project[] = [
    {
      id: 'proj-1',
      name: 'Studio Forma',
      client: 'Forma Studio Ltd',
      description: 'Comprehensive brand identity and web overhaul for modern architectural studio.',
      color: '#07549A', // Cobalt
      deadline: '2026-11-25',
      createdAt: '2026-11-01',
    },
    {
      id: 'proj-2',
      name: 'Northstar Coffee',
      client: 'Northstar Roasters',
      description: 'Specialty coffee packaging, e-commerce assets and visual identity refresh.',
      color: '#8A9A74', // Sage
      deadline: '2026-11-28',
      createdAt: '2026-11-02',
    },
    {
      id: 'proj-3',
      name: 'Nettle Energy',
      client: 'Nettle Botanical Drinks',
      description: 'Q4 social campaign, motion templates and packaging renders.',
      color: '#C86D51', // Terracotta
      deadline: '2026-11-16',
      createdAt: '2026-11-03',
    },
  ];

  // Studio Forma Tasks
  const taskFormaResearch: Task = {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Website research',
    description: 'Competitive analysis of contemporary architectural agency sites.',
    priority: 'medium',
    deadline: '2026-11-12',
    completed: true,
    completedAt: '2026-11-05T14:00:00Z',
    createdAt: '2026-11-01',
    subtasks: [
      { id: 'sub-1', taskId: 'task-1', title: 'Compile 10 reference URLs', durationMinutes: 25, completed: true, order: 1 },
      { id: 'sub-2', taskId: 'task-1', title: 'Audit typographic trends', durationMinutes: 30, completed: true, order: 2 },
    ],
  };

  const taskFormaSitemap: Task = {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Sitemap',
    description: 'Information architecture and page relationship diagrams.',
    priority: 'medium',
    deadline: '2026-11-14',
    completed: true,
    completedAt: '2026-11-06T11:00:00Z',
    createdAt: '2026-11-01',
    subtasks: [
      { id: 'sub-3', taskId: 'task-2', title: 'Draft primary navigation hierarchy', durationMinutes: 20, completed: true, order: 1 },
      { id: 'sub-4', taskId: 'task-2', title: 'Review content requirements with client', durationMinutes: 25, completed: true, order: 2 },
    ],
  };

  const taskFormaWireframes: Task = {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Wireframes',
    description: 'Low fidelity wireframes for core desktop and mobile screens.',
    priority: 'high',
    deadline: '2026-11-18',
    completed: true,
    completedAt: '2026-11-08T16:30:00Z',
    createdAt: '2026-11-02',
    subtasks: [
      { id: 'sub-5', taskId: 'task-3', title: 'Wireframe hero and navigation', durationMinutes: 30, completed: true, order: 1 },
      { id: 'sub-6', taskId: 'task-3', title: 'Wireframe project showcase grid', durationMinutes: 45, completed: true, order: 2 },
    ],
  };

  // The featured task matching the screenshots!
  const taskFormaDesignDraft: Task = {
    id: 'task-4',
    projectId: 'proj-1',
    title: 'Design draft',
    description: 'High-fidelity visual design for the homepage showcase.',
    priority: 'high',
    deadline: '2026-11-20',
    preferredDate: today,
    completed: false,
    createdAt: '2026-11-03',
    subtasks: [
      { id: 'sub-7', taskId: 'task-4', title: 'Plan layout', durationMinutes: 10, completed: true, completedAt: '2026-11-09T09:20:00Z', order: 1 },
      { id: 'sub-8', taskId: 'task-4', title: 'Gather assets', durationMinutes: 15, completed: true, completedAt: '2026-11-09T09:45:00Z', order: 2 },
      { id: 'sub-9', taskId: 'task-4', title: 'Create draft', durationMinutes: 60, completed: false, order: 3 },
      { id: 'sub-10', taskId: 'task-4', title: 'Review and tidy', durationMinutes: 30, completed: false, order: 4 },
    ],
  };

  const taskFormaMobile: Task = {
    id: 'task-5',
    projectId: 'proj-1',
    title: 'Mobile layouts',
    description: 'Responsive styling and touch interactions for mobile devices.',
    priority: 'medium',
    deadline: '2026-11-23',
    completed: false,
    createdAt: '2026-11-04',
    subtasks: [
      { id: 'sub-11', taskId: 'task-5', title: 'Design mobile navigation drawer', durationMinutes: 25, completed: false, order: 1 },
      { id: 'sub-12', taskId: 'task-5', title: 'Adjust typography scale for small screens', durationMinutes: 35, completed: false, order: 2 },
      { id: 'sub-13', taskId: 'task-5', title: 'Touch target ergonomics review', durationMinutes: 20, completed: false, order: 3 },
    ],
  };

  const taskFormaReview: Task = {
    id: 'task-6',
    projectId: 'proj-1',
    title: 'Final review',
    description: 'Pre-flight check with Studio Forma stakeholders.',
    priority: 'high',
    deadline: '2026-11-25',
    completed: false,
    createdAt: '2026-11-04',
    subtasks: [
      { id: 'sub-14', taskId: 'task-6', title: 'Walkthrough presentation slides', durationMinutes: 30, completed: false, order: 1 },
      { id: 'sub-15', taskId: 'task-6', title: 'Consolidate client feedback notes', durationMinutes: 20, completed: false, order: 2 },
    ],
  };

  // Northstar Coffee Tasks
  const taskCoffeeDiscovery: Task = {
    id: 'task-7',
    projectId: 'proj-2',
    title: 'Brand discovery',
    description: 'Interview roasters and establish core brand narrative.',
    priority: 'medium',
    deadline: '2026-11-15',
    completed: true,
    completedAt: '2026-11-07T12:00:00Z',
    createdAt: '2026-11-02',
    subtasks: [
      { id: 'sub-16', taskId: 'task-7', title: 'Interview head roaster', durationMinutes: 45, completed: true, order: 1 },
      { id: 'sub-17', taskId: 'task-7', title: 'Extract brand value keywords', durationMinutes: 20, completed: true, order: 2 },
    ],
  };

  const taskCoffeeCompetitor: Task = {
    id: 'task-8',
    projectId: 'proj-2',
    title: 'Competitor research',
    description: 'Analyze Scandinavian and Japanese specialty coffee branding.',
    priority: 'low',
    deadline: '2026-11-17',
    completed: true,
    completedAt: '2026-11-08T10:00:00Z',
    createdAt: '2026-11-02',
    subtasks: [
      { id: 'sub-18', taskId: 'task-8', title: 'Screen benchmark roasteries', durationMinutes: 30, completed: true, order: 1 },
      { id: 'sub-19', taskId: 'task-8', title: 'Identify packaging packaging differentiators', durationMinutes: 25, completed: true, order: 2 },
    ],
  };

  const taskCoffeeMoodboard: Task = {
    id: 'task-9',
    projectId: 'proj-2',
    title: 'Moodboard',
    description: 'Curate physical paper textures, typography styles, and packaging materials.',
    priority: 'high',
    deadline: '2026-11-20',
    preferredDate: tomorrow,
    completed: false,
    createdAt: '2026-11-03',
    subtasks: [
      { id: 'sub-20', taskId: 'task-9', title: 'Gather visual references', durationMinutes: 30, completed: false, order: 1 },
      { id: 'sub-21', taskId: 'task-9', title: 'Curate earthy warm color palette', durationMinutes: 25, completed: false, order: 2 },
      { id: 'sub-22', taskId: 'task-9', title: 'Assemble moodboard layout in Figma', durationMinutes: 35, completed: false, order: 3 },
    ],
  };

  const taskCoffeeLogo: Task = {
    id: 'task-10',
    projectId: 'proj-2',
    title: 'Logo exploration',
    description: 'Vector logo marks, lockups and stamps.',
    priority: 'medium',
    deadline: '2026-11-24',
    completed: false,
    createdAt: '2026-11-04',
    subtasks: [
      { id: 'sub-23', taskId: 'task-10', title: 'Pencil sketches of star symbol', durationMinutes: 40, completed: false, order: 1 },
      { id: 'sub-24', taskId: 'task-10', title: 'Vectorize top 3 concepts', durationMinutes: 50, completed: false, order: 2 },
    ],
  };

  const taskCoffeeGuidelines: Task = {
    id: 'task-11',
    projectId: 'proj-2',
    title: 'Brand guidelines',
    description: 'Concise 12-page PDF brand guide.',
    priority: 'low',
    deadline: '2026-11-28',
    completed: false,
    createdAt: '2026-11-05',
    subtasks: [
      { id: 'sub-25', taskId: 'task-11', title: 'Define minimum clearspace and sizing', durationMinutes: 20, completed: false, order: 1 },
      { id: 'sub-26', taskId: 'task-11', title: 'Export final logo asset packages', durationMinutes: 30, completed: false, order: 2 },
    ],
  };

  // Nettle Energy Tasks
  const taskNettleCampaign: Task = {
    id: 'task-12',
    projectId: 'proj-3',
    title: 'Campaign research',
    description: 'Identify clean energy drink tone of voice and audiences.',
    priority: 'high',
    deadline: '2026-11-10',
    completed: false,
    createdAt: '2026-11-02',
    subtasks: [
      { id: 'sub-27', taskId: 'task-12', title: 'Examine competitive social campaigns', durationMinutes: 30, completed: false, order: 1 },
      { id: 'sub-28', taskId: 'task-12', title: 'Synthesize audience pain points', durationMinutes: 20, completed: false, order: 2 },
    ],
  };

  const taskNettleConcepts: Task = {
    id: 'task-13',
    projectId: 'proj-3',
    title: 'Creative concepts',
    description: 'Draft 3 campaign hooks for botanical energy drinks.',
    priority: 'medium',
    deadline: '2026-11-12',
    completed: false,
    createdAt: '2026-11-03',
    subtasks: [
      { id: 'sub-29', taskId: 'task-13', title: 'Brainstorm 15 taglines', durationMinutes: 25, completed: false, order: 1 },
      { id: 'sub-30', taskId: 'task-13', title: 'Select top 3 campaign directions', durationMinutes: 25, completed: false, order: 2 },
    ],
  };

  const taskNettleTemplates: Task = {
    id: 'task-14',
    projectId: 'proj-3',
    title: 'Social media templates',
    description: '9:16 story and 4:5 feed templates.',
    priority: 'medium',
    deadline: '2026-11-14',
    completed: false,
    createdAt: '2026-11-04',
    subtasks: [
      { id: 'sub-31', taskId: 'task-14', title: 'Create Instagram feed grid template', durationMinutes: 40, completed: false, order: 1 },
      { id: 'sub-32', taskId: 'task-14', title: 'Create vertical video title cards', durationMinutes: 35, completed: false, order: 2 },
    ],
  };

  const taskNettleExports: Task = {
    id: 'task-15',
    projectId: 'proj-3',
    title: 'Final exports',
    description: 'Deliver packaged Adobe & Figma assets.',
    priority: 'low',
    deadline: '2026-11-16',
    completed: false,
    createdAt: '2026-11-05',
    subtasks: [
      { id: 'sub-33', taskId: 'task-15', title: 'Export clean master components', durationMinutes: 30, completed: false, order: 1 },
      { id: 'sub-34', taskId: 'task-15', title: 'Upload package to Google Drive', durationMinutes: 15, completed: false, order: 2 },
    ],
  };

  const allTasks = [
    taskFormaResearch,
    taskFormaSitemap,
    taskFormaWireframes,
    taskFormaDesignDraft,
    taskFormaMobile,
    taskFormaReview,
    taskCoffeeDiscovery,
    taskCoffeeCompetitor,
    taskCoffeeMoodboard,
    taskCoffeeLogo,
    taskCoffeeGuidelines,
    taskNettleCampaign,
    taskNettleConcepts,
    taskNettleTemplates,
    taskNettleExports,
  ];

  // Calendar Events (Fixed events and breaks)
  const events: CalendarEvent[] = [
    {
      id: 'event-lunch-today',
      title: 'Lunch',
      date: today,
      startTime: '12:00',
      endTime: '12:45',
      type: 'lunch',
      description: 'Scheduled midday lunch break',
    },
    {
      id: 'event-sync-today',
      title: 'Client review call',
      date: today,
      startTime: '11:30',
      endTime: '12:00',
      type: 'meeting',
      description: 'Studio Forma weekly progress sync',
      projectId: 'proj-1',
    },
    {
      id: 'event-lunch-tomorrow',
      title: 'Lunch',
      date: tomorrow,
      startTime: '12:00',
      endTime: '12:45',
      type: 'lunch',
    },
  ];

  // Initial Scheduled Sessions matching Screen 1 from the reference!
  const sessions: ScheduledSession[] = [
    {
      id: 'sess-1',
      taskId: 'task-4',
      subtaskId: 'sub-7',
      date: today,
      startTime: '09:00',
      endTime: '09:10',
      durationMinutes: 10,
      isLocked: false,
      isCompleted: true,
      completedAt: '2026-11-09T09:10:00Z',
    },
    {
      id: 'sess-2',
      taskId: 'task-4',
      subtaskId: 'sub-8',
      date: today,
      startTime: '09:10',
      endTime: '09:25',
      durationMinutes: 15,
      isLocked: false,
      isCompleted: true,
      completedAt: '2026-11-09T09:25:00Z',
    },
    {
      id: 'sess-3',
      taskId: 'task-4',
      subtaskId: 'sub-9', // "Create draft" - the current active focus step!
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      durationMinutes: 60,
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 'sess-4',
      taskId: 'task-4',
      subtaskId: 'sub-10', // "Review and tidy"
      date: today,
      startTime: '11:00',
      endTime: '11:30',
      durationMinutes: 30,
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 'sess-5',
      taskId: 'task-5',
      subtaskId: 'sub-11', // Studio Forma - Mobile layouts
      date: today,
      startTime: '13:00',
      endTime: '13:25',
      durationMinutes: 25,
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 'sess-6',
      taskId: 'task-5',
      subtaskId: 'sub-12',
      date: today,
      startTime: '13:30',
      endTime: '14:05',
      durationMinutes: 35,
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 'sess-7',
      taskId: 'task-9',
      subtaskId: 'sub-20', // Northstar Coffee - Moodboard step 1
      date: tomorrow,
      startTime: '09:30',
      endTime: '10:00',
      durationMinutes: 30,
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 'sess-8',
      taskId: 'task-9',
      subtaskId: 'sub-21',
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:25',
      durationMinutes: 25,
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 'sess-9',
      taskId: 'task-12',
      subtaskId: 'sub-27', // Nettle Energy - Campaign research
      date: dayAfter,
      startTime: '09:30',
      endTime: '10:00',
      durationMinutes: 30,
      isLocked: false,
      isCompleted: false,
    },
  ];

  const defaultDayHours = {
    start: '09:00',
    end: '17:00',
    enabled: true,
  };

  const settings: AppSettings = {
    workSchedule: {
      workingDays: [1, 2, 3, 4, 5], // Mon to Fri
      dayHours: {
        1: { ...defaultDayHours },
        2: { ...defaultDayHours },
        3: { ...defaultDayHours, start: '10:00', end: '18:00' }, // Example custom Wednesday
        4: { ...defaultDayHours },
        5: { ...defaultDayHours, start: '09:00', end: '16:00' }, // Example Friday half-day
        6: { start: '10:00', end: '14:00', enabled: false },
        0: { start: '10:00', end: '14:00', enabled: false },
      },
      lunchBreak: {
        enabled: true,
        start: '12:00',
        end: '12:45',
        title: 'Lunch',
      },
      bufferMinutes: 0,
    },
    scheduling: {
      prioritizeBy: 'priority-first',
      multiDay: true,
      autoRolling: true,
    },
    focus: {
      soundEnabled: true,
      autoNext: false,
      tickSound: false,
    },
    theme: 'light',
  };

  return {
    projects,
    tasks: allTasks,
    events,
    sessions,
    settings,
  };
}
