export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatReadableDate(dateKey: string): { dayName: string; formatted: string; relative: string } {
  const date = parseDateKey(dateKey);
  const todayKey = formatDateKey(new Date());
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  let relative = '';
  if (dateKey === todayKey) relative = 'Today';
  else if (dateKey === tomorrowKey) relative = 'Tomorrow';
  else if (dateKey === yesterdayKey) relative = 'Yesterday';

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  return {
    dayName,
    formatted: `${dayName}, ${dayNum} ${monthName}`,
    relative,
  };
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(normalized / 60) % 24;
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

export function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function getDayOfWeek(dateKey: string): number {
  return parseDateKey(dateKey).getDay(); // 0 = Sunday, 1 = Monday, etc.
}

export function isPastDateTime(dateKey: string, timeStr: string): boolean {
  const now = new Date();
  const todayKey = formatDateKey(now);
  if (dateKey < todayKey) return true;
  if (dateKey > todayKey) return false;
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = timeToMinutes(timeStr);
  return targetMinutes < currentMinutes;
}

export function getCurrentTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
