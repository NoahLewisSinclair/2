import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Clock, Calendar, Flag } from 'lucide-react';
import { Project, Task, Subtask, Priority } from '../types';
import { formatDateKey } from '../utils/dateUtils';

interface CreateTaskModalProps { isOpen: boolean; onClose: () => void; projects: Project[]; defaultProjectId?: string; defaultDate?: string; onCreateTask: (task: Task) => void; }

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, projects, defaultProjectId, defaultDate, onCreateTask }) => {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [priority, setPriority] = useState<Priority>('medium'); const [deadline, setDeadline] = useState('');
  const [preferredDate, setPreferredDate] = useState(defaultDate || formatDateKey(new Date())); const [estimatedMinutes, setEstimatedMinutes] = useState('60');
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; durationMinutes: number }>>([
    { id: 'step-1', title: 'Prepare brief & gather materials', durationMinutes: 15 },
    { id: 'step-2', title: 'Execute primary production', durationMinutes: 30 },
    { id: 'step-3', title: 'Review and refine', durationMinutes: 15 },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false); const [aiNotice, setAiNotice] = useState<string | null>(null);
  React.useEffect(() => { if (defaultProjectId) setProjectId(defaultProjectId); if (defaultDate) setPreferredDate(defaultDate); }, [defaultProjectId, defaultDate]);
  if (!isOpen) return null;

  const handleAiBreakdown = async () => {
    if (!title.trim()) { setAiNotice('Enter a task title first.'); return; }
    setIsAiLoading(true); setAiNotice(null);
    try {
      const res = await fetch('/api/breakdown', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), description: description.trim(), estimatedMinutes: parseInt(estimatedMinutes, 10) || 60 }) });
      if (!res.ok) throw new Error(`Breakdown request failed (${res.status})`);
      const data = await res.json();
      if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        setSubtasks(data.subtasks.map((item: any, idx: number) => ({ id: `step-${Date.now()}-${idx}`, title: String(item.title || 'Step'), durationMinutes: Math.max(5, Number(item.durationMinutes) || 20) })));
        setAiNotice(data.source === 'ai' ? 'Generated with Gemini AI.' : 'Suggested breakdown (local fallback).');
      } else setAiNotice('No suggestions returned. Add steps manually.');
    } catch (err) { console.error('Breakdown error:', err); setAiNotice('AI breakdown unavailable. You can add steps manually.'); }
    finally { setIsAiLoading(false); }
  };

  const handleAddSubtask = () => setSubtasks(prev => [...prev, { id: `step-${Date.now()}-${prev.length}`, title: '', durationMinutes: 20 }]);
  const handleUpdateSubtask = (id: string, field: 'title' | 'durationMinutes', value: string | number) => setSubtasks(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  const handleDeleteSubtask = (id: string) => setSubtasks(prev => prev.filter(s => s.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!title.trim()) return;
    const taskId = `task-${Date.now()}`;
    const cleanSubtasks: Subtask[] = subtasks.filter(s => s.title.trim()).map((s, idx) => ({ id: `sub-${Date.now()}-${idx}`, taskId, title: s.title.trim(), durationMinutes: Math.max(5, Number(s.durationMinutes) || 15), completed: false, order: idx + 1 }));
    if (!cleanSubtasks.length) cleanSubtasks.push({ id: `sub-${Date.now()}-0`, taskId, title: title.trim(), durationMinutes: Math.max(5, parseInt(estimatedMinutes, 10) || 30), completed: false, order: 1 });
    onCreateTask({ id: taskId, title: title.trim(), description: description.trim() || undefined, projectId: projectId || undefined, priority, deadline: deadline || undefined, preferredDate: preferredDate || undefined, estimatedMinutes: parseInt(estimatedMinutes, 10) || 60, completed: false, createdAt: new Date().toISOString(), subtasks: cleanSubtasks });
    setTitle(''); setDescription(''); setProjectId(defaultProjectId || ''); setPriority('medium'); setDeadline(''); setPreferredDate(defaultDate || formatDateKey(new Date())); setEstimatedMinutes('60');
    setSubtasks([{ id: 'step-1', title: 'Prepare brief & gather materials', durationMinutes: 15 }, { id: 'step-2', title: 'Execute primary production', durationMinutes: 30 }, { id: 'step-3', title: 'Review and refine', durationMinutes: 15 }]); setAiNotice(null); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-black/[0.08] relative max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0"><h2 className="font-heading font-bold text-2xl text-[#171717] tracking-tight">New Task</h2><button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[#171717]/60 hover:text-[#171717] hover:bg-black/5 transition-colors" aria-label="Close"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Task Title *</label><input type="text" placeholder="e.g. Design homepage showcase" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm font-semibold outline-none focus:border-[#07549A] transition-colors" /></div>
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Description (optional)</label><textarea placeholder="Context, requirements or deliverables..." value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-medium outline-none focus:border-[#07549A] resize-none transition-colors" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Project</label><select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold bg-white outline-none focus:border-[#07549A]"><option value="">(No project)</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Priority</label><select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold bg-white outline-none focus:border-[#07549A]"><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Preferred Date</label><input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold outline-none focus:border-[#07549A]" /></div><div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Deadline (optional)</label><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold outline-none focus:border-[#07549A]" /></div></div>
          <div className="pt-2 border-t border-black/[0.06]"><div className="flex items-center justify-between mb-2"><label className="text-xs font-bold text-[#171717]">Subtasks ({subtasks.length})</label><button type="button" onClick={handleAiBreakdown} disabled={isAiLoading || !title.trim()} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#07549A]/10 text-[#07549A] hover:bg-[#07549A]/20 transition-colors text-xs font-semibold disabled:opacity-50"><Sparkles className="w-3.5 h-3.5" />{isAiLoading ? 'Breaking down…' : 'Break down task with AI'}</button></div>
          {aiNotice && <div className="text-[11px] font-semibold text-[#07549A] mb-2 px-2.5 py-1 rounded-lg bg-[#07549A]/10">{aiNotice}</div>}
          <div className="space-y-2">{subtasks.map((step, idx) => <div key={step.id} className="flex items-center gap-2"><span className="text-xs font-bold text-[#171717]/40 w-4">{idx + 1}.</span><input type="text" placeholder="Step action…" value={step.title} onChange={e => handleUpdateSubtask(step.id, 'title', e.target.value)} className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-black/10 text-xs font-medium outline-none focus:border-[#07549A]" /><input type="number" min="5" max="180" step="5" aria-label="Step duration in minutes" value={step.durationMinutes} onChange={e => handleUpdateSubtask(step.id, 'durationMinutes', Math.max(5, parseInt(e.target.value, 10) || 5))} className="w-14 px-1 py-1 text-center text-xs font-semibold rounded border border-black/10 outline-none" /><span className="text-[11px] text-[#171717]/50">m</span><button type="button" onClick={() => handleDeleteSubtask(step.id)} aria-label="Remove step" className="p-1 text-[#171717]/30 hover:text-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>)}</div>
          <button type="button" onClick={handleAddSubtask} className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#07549A] hover:underline"><Plus className="w-3.5 h-3.5" />Add another step</button></div>
          <div className="pt-3"><button type="submit" className="w-full py-3.5 rounded-2xl bg-[#07549A] hover:bg-[#053C6E] text-white font-semibold text-sm shadow-sm transition-all">Create &amp; Save Task</button></div>
        </form>
      </div>
    </div>
  );
};
