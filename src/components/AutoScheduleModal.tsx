import React, { useState } from 'react';
import { ArrowLeft, CalendarDays, Clock3, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAutoSchedule: () => { scheduledCount: number; daysCount: number; message: string };
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenWorkSchedule?: () => void;
}

export const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({
  isOpen, onClose, onRunAutoSchedule, settings, onOpenWorkSchedule,
}) => {
  const [result, setResult] = useState<{ scheduledCount: number; daysCount: number; message: string } | null>(null);
  const [running, setRunning] = useState(false);
  if (!isOpen) return null;

  const workingDays = settings.workSchedule.workingDays
    .slice().sort((a, b) => a - b)
    .map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]);
  const hours = settings.workSchedule.dayHours;
  const firstDay = settings.workSchedule.workingDays[0];
  const firstHours = hours[firstDay];
  const hoursLabel = firstHours ? `${firstHours.start}–${firstHours.end}` : 'Set your hours';

  const run = () => {
    if (running) return;
    setRunning(true);
    try {
      const scheduled = onRunAutoSchedule();
      setResult(scheduled);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-black/[0.08]">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-[#171717] hover:bg-black/5" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-[#171717]/45">DAYFRAME PLANNER</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#07549A]/10 text-[#07549A] flex items-center justify-center"><CalendarDays className="w-5 h-5" /></div>
          <h2 className="font-heading font-bold text-2xl text-[#171717] tracking-tight">Schedule my work</h2>
        </div>
        <p className="text-sm text-[#171717]/65 mb-5">Dayframe will organise your unfinished tasks around your working hours and keep your schedule up to date.</p>
        <button onClick={onOpenWorkSchedule} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#F5F6F7] border border-black/[0.05] text-left mb-4 hover:bg-[#EEF1F4]">
          <div className="flex items-center gap-3">
            <Clock3 className="w-5 h-5 text-[#07549A]" />
            <div>
              <div className="text-sm font-semibold text-[#171717]">Your working hours</div>
              <div className="text-xs text-[#171717]/60">{workingDays.join(', ') || 'No working days'} · {hoursLabel}</div>
            </div>
          </div>
          <span className="text-[#07549A] text-sm font-semibold">Edit</span>
        </button>
        <div className="text-xs text-[#171717]/65 leading-relaxed mb-5">
          <p>Dayframe prioritises your tasks, fits them into available time and continues onto future working days when needed.</p>
          <p className="mt-2">Fixed events, breaks and locked sessions stay where they are.</p>
        </div>
        <button onClick={run} disabled={running} className="w-full py-4 px-4 rounded-2xl bg-[#07549A] hover:bg-[#053C6E] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70">
          <Sparkles className="w-4 h-4" /> {running ? 'Organising your day…' : 'Auto Schedule'}
        </button>
        {result && (
          <div className="mt-4 p-4 rounded-2xl bg-[#E2E4D8]/70 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#07549A] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#171717]">Schedule updated</div>
              <div className="text-xs text-[#171717]/70 mt-1">{result.message}</div>
              <button onClick={onClose} className="mt-3 text-xs font-semibold text-[#07549A]">Back to my day</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
