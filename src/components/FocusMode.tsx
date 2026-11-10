import React, { useState, useEffect, useRef } from 'react';
import { X, MoreHorizontal, Play, Pause, SkipForward, SkipBack, Check, ChevronRight } from 'lucide-react';
import { Task } from '../types';
import { playSoftTick } from '../utils/sound';

interface FocusModeProps { task: Task; currentSubtaskId: string; onClose: () => void; onCompleteSubtask: (taskId: string, subtaskId: string) => void; onSkipSubtask: (taskId: string, subtaskId: string) => void; onSwitchSubtask: (taskId: string, subtaskId: string) => void; soundEnabled: boolean; tickSoundEnabled: boolean; }

export const FocusMode: React.FC<FocusModeProps> = ({ task, currentSubtaskId, onClose, onCompleteSubtask, onSkipSubtask, onSwitchSubtask, tickSoundEnabled }) => {
  const subtasks = [...task.subtasks].sort((a, b) => a.order - b.order);
  const currentSubtask = subtasks.find(s => s.id === currentSubtaskId) || subtasks.find(s => !s.completed);
  const currentIndex = subtasks.findIndex(s => s.id === currentSubtask?.id);
  const nextSubtask = subtasks.slice(currentIndex + 1).find(s => !s.completed);
  const remainingSteps = subtasks.filter(s => !s.completed).length;
  const remainingMinutes = subtasks.filter(s => !s.completed).reduce((sum, s) => sum + Math.max(0, s.durationMinutes || 0), 0);
  const estimatedFinish = new Date(Date.now() + remainingMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const targetSeconds = Math.max(1, currentSubtask?.durationMinutes || 25) * 60;
  const timerKey = `dayframe_focus_timer_${task.id}_${currentSubtask?.id || 'none'}`;
  type SavedTimer = { remainingSeconds: number; isPaused: boolean; endAt: number | null };
  const readSaved = (): SavedTimer | null => { try { return JSON.parse(localStorage.getItem(timerKey) || 'null'); } catch { return null; } };
  const saved = readSaved();
  const [remainingSeconds, setRemainingSeconds] = useState(() => saved ? (saved.isPaused || !saved.endAt ? saved.remainingSeconds : Math.max(0, Math.ceil((saved.endAt - Date.now()) / 1000))) : targetSeconds);
  const [isPaused, setIsPaused] = useState(saved?.isPaused ?? true);
  const [showMenu, setShowMenu] = useState(false);
  const endAtRef = useRef<number>(saved?.endAt || Date.now() + targetSeconds * 1000);

  useEffect(() => {
    const existing = readSaved();
    const target = Math.max(1, currentSubtask?.durationMinutes || 25) * 60;
    const remaining = existing ? (existing.isPaused || !existing.endAt ? existing.remainingSeconds : Math.max(0, Math.ceil((existing.endAt - Date.now()) / 1000))) : target;
    endAtRef.current = existing?.endAt || Date.now() + target * 1000;
    setRemainingSeconds(remaining); setIsPaused(existing?.isPaused ?? true);
  }, [timerKey, currentSubtask?.id]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemainingSeconds(previous => { if (tickSoundEnabled && next > 0 && next < previous && next % 60 === 0) playSoftTick(); return next; });
    }, 250);
    return () => clearInterval(interval);
  }, [isPaused, tickSoundEnabled]);

  useEffect(() => { try { localStorage.setItem(timerKey, JSON.stringify({ remainingSeconds, isPaused, endAt: isPaused ? null : endAtRef.current })); } catch { /* storage may be unavailable */ } }, [timerKey, remainingSeconds, isPaused]);

  const togglePause = () => {
    if (isPaused) { endAtRef.current = Date.now() + remainingSeconds * 1000; setIsPaused(false); }
    else { setRemainingSeconds(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))); setIsPaused(true); }
  };
  const complete = () => { if (currentSubtask) { try { localStorage.removeItem(timerKey); } catch {} onCompleteSubtask(task.id, currentSubtask.id); } };
  const skip = () => { if (currentSubtask) { try { localStorage.removeItem(timerKey); } catch {} onSkipSubtask(task.id, currentSubtask.id); } };
  const formatTimer = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const progress = targetSeconds > 0 ? Math.min(1, (targetSeconds - remainingSeconds) / targetSeconds) : 0;

  if (!currentSubtask) return null;
  return (
    <div className="fixed inset-0 z-50 bg-[#07549A] text-white flex flex-col justify-between overflow-hidden select-none">
      <div className="pt-6 px-6 pb-2 flex items-center justify-between z-10">
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors" aria-label="Exit Focus Mode"><X className="w-6 h-6" /></button>
        <div className="flex items-center gap-2 max-w-[200px] overflow-x-auto py-1">{subtasks.map((sub, idx) => <button key={sub.id} onClick={() => onSwitchSubtask(task.id, sub.id)} className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center transition-all ${sub.completed ? 'bg-white text-[#07549A]' : sub.id === currentSubtask.id ? 'bg-white/30 text-white border border-white' : 'border border-white/40 text-transparent'}`} title={`Step ${idx + 1}: ${sub.title}`}>{sub.completed ? <Check className="w-4 h-4 stroke-[3]" /> : sub.id === currentSubtask.id ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : null}</button>)}</div>
        <div className="relative"><button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors" aria-label="Options"><MoreHorizontal className="w-6 h-6" /></button>{showMenu && <div className="absolute right-0 top-12 w-48 bg-white text-[#171717] rounded-2xl shadow-2xl p-2 z-30"><button onClick={() => { setRemainingSeconds(prev => { const next = prev + 300; if (!isPaused) endAtRef.current = Date.now() + next * 1000; return next; }); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#F4F5F0] rounded-xl">+ 5 minutes</button><button onClick={() => { setRemainingSeconds(targetSeconds); endAtRef.current = Date.now() + targetSeconds * 1000; setIsPaused(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#F4F5F0] rounded-xl">Reset timer</button><button onClick={() => { setShowMenu(false); skip(); }} className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-xl">Skip this step</button></div>}</div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-8 z-10 max-w-lg mx-auto w-full">
        <div className="mb-2"><span className="text-xs font-bold tracking-wider text-white/75 uppercase">{task.title} · Step {currentIndex + 1} of {subtasks.length}</span></div>
        <h1 className="font-heading font-bold text-4xl sm:text-5xl tracking-tight leading-tight mb-8 text-white">{currentSubtask.title}</h1>
        <div className="mb-6"><div className="font-heading font-bold text-6xl sm:text-7xl tracking-tighter tabular-nums text-white">{formatTimer(remainingSeconds)}</div>{remainingSeconds === 0 && <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-white/20 text-white">Estimated time reached — keep working or complete</span>}</div>
        <div className="h-2 w-full bg-white/25 rounded-full overflow-hidden mb-12"><div className="h-full bg-white rounded-full transition-all duration-300 ease-out" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
        <div className="flex items-center justify-center gap-8 mb-6"><button onClick={skip} className="w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all" aria-label="Skip to next step"><SkipBack className="w-6 h-6 fill-current" /></button><button onClick={togglePause} className="w-20 h-20 rounded-full bg-white text-[#07549A] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all" aria-label={isPaused ? 'Start or resume focus' : 'Pause focus'}>{isPaused ? <Play className="w-8 h-8 fill-current ml-1" /> : <Pause className="w-8 h-8 fill-current" />}</button><button onClick={complete} className="w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all" aria-label="Complete step"><Check className="w-7 h-7" /></button></div>
      </div>
      <div className="p-4 z-10 max-w-lg mx-auto w-full">{nextSubtask ? <button onClick={() => onSwitchSubtask(task.id, nextSubtask.id)} className="w-full py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-between text-xs font-medium text-white transition-colors"><span className="truncate"><strong>Next:</strong> {nextSubtask.title} · {nextSubtask.durationMinutes}m</span><ChevronRight className="w-4 h-4 shrink-0 text-white/80 ml-2" /></button> : <div className="w-full py-3 px-5 rounded-2xl bg-white/10 text-center text-xs font-semibold text-white/80">Final step in this task</div>}<div className="flex items-center justify-between px-1 pt-3 text-[11px] font-medium text-white/75"><span>{remainingSteps} {remainingSteps === 1 ? 'step' : 'steps'} remaining</span><span>Est. finish {estimatedFinish}</span></div></div>
    </div>
  );
};
