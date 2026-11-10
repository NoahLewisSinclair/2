# Dayframe

A mobile-first task planner built with React, TypeScript and Vite.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Production build

```bash
npm run build
npm run preview
```

## Current implementation notes

- Projects, tasks, subtasks, events, schedules and preferences are stored in browser local storage.
- The internal calendar does not require Google Calendar or another external calendar service.
- Scheduling is local and deterministic. It schedules complete subtask durations, respects working hours and fixed events, and rolls work across future working days.
- Overdue flexible work is reconciled when the app opens, returns to the foreground and periodically while open.
- Focus Mode stores its timer state locally and uses an end timestamp so backgrounding the browser does not reset the countdown.
- The app can be installed as a PWA where supported by the browser.

## Important limitations

- Local storage is specific to the browser/device. Data does not automatically synchronise between devices.
- Browser code cannot run while the app is fully closed. Missed work is reconciled when the app is opened again.
- AI task breakdown requires a working, securely configured runtime model connection. If that connection is unavailable, use the task editor to add or edit subtasks manually; do not treat fallback suggestions as AI-generated.
