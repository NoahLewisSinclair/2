import React, { useEffect } from 'react';
import { Play, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subtask, Task } from '../types';

interface StepCompleteModalProps { completedSubtask: Subtask | null; task: Task | null; isOpen: boolean; onContinue: () => void; }
export const StepCompleteModal: React.FC<StepCompleteModalProps> = ({ completedSubtask, task, isOpen, onContinue }) => {
  useEffect(() => { if (isOpen) { try { confetti({ particleCount: 20, spread: 55, origin: { y: 0.6 }, colors: ['#07549A', '#E2E4D8', '#171717'], disableForReducedMotion: true }); } catch {} } }, [isOpen]);
  if (!isOpen || !completedSubtask || !task) return null;
  const total = task.subtasks.length; const completed = task.subtasks.filter(s => s.completed).length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"><div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl border border-black/[0.08] text-center"><div className="relative inline-block mb-4"><div className="w-16 h-16 rounded-2xl bg-[#07549A] text-white flex items-center justify-center mx-auto shadow-md"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div><Sparkles className="w-4 h-4 text-[#07549A] absolute -top-1 -right-2" /></div><h2 className="font-heading font-bold text-3xl text-[#171717] tracking-tight mb-1">Step complete</h2><p className="text-sm font-semibold text-[#171717]/70 mb-6">{completedSubtask.title}</p><div className="bg-[#F8F9FA] rounded-2xl p-4 border border-black/[0.04] mb-6"><div className="text-xs font-semibold text-[#171717]/80 mb-2">{completed} of {total} steps complete</div><div className="flex items-center gap-1.5 h-2">{task.subtasks.map((_, idx) => <div key={idx} className={`flex-1 h-full rounded-full ${idx < completed ? 'bg-[#07549A]' : 'bg-[#E2E4D8]'}`} />)}</div></div><button onClick={onContinue} className="w-full py-3.5 px-4 rounded-2xl bg-[#07549A] hover:bg-[#053C6E] text-white font-semibold text-sm flex items-center justify-center gap-2"><Play className="w-4 h-4 fill-current ml-0.5" />Continue to next step</button></div></div>
  );
};
