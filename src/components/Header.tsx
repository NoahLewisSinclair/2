import React from 'react';
import { Calendar, Plus, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatReadableDate, addDays, formatDateKey } from '../utils/dateUtils';

interface HeaderProps { selectedDate: string; onSelectDate: (date: string) => void; onOpenDatePicker: () => void; onOpenAutoSchedule: () => void; onOpenCreateTask: () => void; completedStepsCount: number; totalStepsCount: number; remainingMinutes: number; }

export const Header: React.FC<HeaderProps> = ({ selectedDate, onSelectDate, onOpenDatePicker, onOpenAutoSchedule, onOpenCreateTask, completedStepsCount, totalStepsCount, remainingMinutes }) => {
  const { dayName, formatted, relative } = formatReadableDate(selectedDate);
  const isToday = relative === 'Today';
  const percentComplete = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;
  const hours = Math.floor(remainingMinutes / 60); const mins = remainingMinutes % 60;
  const remaining = hours > 0 ? `~ ${hours}h ${mins > 0 ? `${mins}m ` : ''}left` : remainingMinutes > 0 ? `~ ${remainingMinutes}m left` : 'All done';
  return (
    <header className="pt-2 pb-3 px-5 border-b border-black/[0.06] bg-white sticky top-0 z-20">
      <div className="flex items-center justify-between h-10"><span className="font-heading font-bold text-2xl tracking-tight text-[#171717]">Dayframe<span className="text-xs font-semibold align-super ml-0.5">®</span></span><div className="flex items-center gap-1.5"><button onClick={onOpenAutoSchedule} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#07549A] bg-[#07549A]/10 hover:bg-[#07549A]/15 rounded-lg transition-colors" title="Auto Schedule"><Sparkles className="w-3.5 h-3.5" /><span className="hidden sm:inline">Auto Schedule</span></button><button onClick={onOpenDatePicker} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#171717] hover:bg-black/5 transition-colors" aria-label="Select date"><Calendar className="w-5 h-5" /></button><button onClick={onOpenCreateTask} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#07549A] text-white hover:bg-[#053C6E] transition-colors shadow-sm" aria-label="Add new task"><Plus className="w-5 h-5" /></button></div></div>
      <div className="mt-3 flex items-center justify-between"><div><div className="flex items-center gap-2"><h1 className="font-heading font-bold text-3xl text-[#171717] tracking-tight">{relative || dayName}</h1>{!isToday && <button onClick={() => onSelectDate(formatDateKey(new Date()))} className="text-xs font-semibold px-2 py-0.5 rounded bg-[#07549A]/10 text-[#07549A]">Go to Today</button>}</div><p className="text-sm font-medium text-[#171717]/60 mt-0.5">{formatted}</p></div><div className="flex items-center gap-1 bg-[#F4F5F0] rounded-lg p-0.5"><button onClick={() => onSelectDate(addDays(selectedDate, -1))} className="w-8 h-8 flex items-center justify-center rounded text-[#171717]/70 hover:bg-white" aria-label="Previous day"><ChevronLeft className="w-4 h-4" /></button><button onClick={() => onSelectDate(addDays(selectedDate, 1))} className="w-8 h-8 flex items-center justify-center rounded text-[#171717]/70 hover:bg-white" aria-label="Next day"><ChevronRight className="w-4 h-4" /></button></div></div>
      <div className="mt-4"><div className="flex items-center justify-between text-xs font-medium text-[#171717]/70 mb-1.5"><span>{totalStepsCount > 0 ? `${completedStepsCount} of ${totalStepsCount} steps complete` : 'No steps scheduled for this date'}</span>{totalStepsCount > 0 && <span className="tabular-nums font-semibold">{remaining}</span>}</div><div className="h-1.5 w-full bg-[#E2E4D8]/60 rounded-full overflow-hidden"><div className="h-full bg-[#07549A] rounded-full transition-all duration-300 ease-out" style={{ width: `${percentComplete}%` }} /></div></div>
    </header>
  );
};
