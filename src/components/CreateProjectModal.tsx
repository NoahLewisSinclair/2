import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';

interface CreateProjectModalProps { isOpen: boolean; onClose: () => void; onCreateProject: (project: Project) => void; }
const PRESET_COLORS = ['#07549A', '#8A9A74', '#C86D51', '#3D5A80', '#2B2D42', '#6B705C', '#7B2CBF', '#D4A373'];
export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreateProject }) => {
  const [name, setName] = useState(''); const [client, setClient] = useState(''); const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]); const [deadline, setDeadline] = useState('');
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return;
    onCreateProject({ id: `proj-${Date.now()}`, name: name.trim(), client: client.trim(), description: description.trim(), color, deadline, createdAt: new Date().toISOString() });
    setName(''); setClient(''); setDescription(''); setColor(PRESET_COLORS[0]); setDeadline(''); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-black/[0.08]">
        <div className="flex items-center justify-between mb-4"><h2 className="font-heading font-bold text-xl text-[#171717]">New Project</h2><button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[#171717]/60 hover:bg-black/5" aria-label="Close"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Project Name *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Studio Forma" className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-semibold outline-none focus:border-[#07549A]" /></div>
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Client Name</label><input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Forma Studio Ltd" className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold outline-none focus:border-[#07549A]" /></div>
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brief summary..." className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-medium outline-none focus:border-[#07549A] resize-none" /></div>
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Deadline</label><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold outline-none" /></div>
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1.5">Accent Color</label><div className="flex items-center gap-2 flex-wrap">{PRESET_COLORS.map(c => <button key={c} type="button" aria-label={`Choose ${c}`} onClick={() => setColor(c)} className={`w-7 h-7 rounded-xl transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-[#07549A]' : 'opacity-80'}`} style={{ backgroundColor: c }} />)}</div></div>
          <button type="submit" className="w-full py-3 rounded-2xl bg-[#07549A] hover:bg-[#053C6E] text-white font-semibold text-xs shadow-sm transition-all">Create Project</button>
        </form>
      </div>
    </div>
  );
};
