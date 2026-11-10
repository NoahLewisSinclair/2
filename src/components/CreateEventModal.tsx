import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CalendarEvent, EventType, Project } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  defaultDate: string;
  projects: Project[];
  onSaveEvent: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen, onClose, event, defaultDate, projects, onSaveEvent, onDeleteEvent,
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || defaultDate);
  const [startTime, setStartTime] = useState(event?.startTime || '11:30');
  const [endTime, setEndTime] = useState(event?.endTime || '12:00');
  const [type, setType] = useState<EventType>(event?.type || 'meeting');
  const [description, setDescription] = useState(event?.description || '');
  const [projectId, setProjectId] = useState(event?.projectId || '');

  React.useEffect(() => {
    if (event) {
      setTitle(event.title); setDate(event.date); setStartTime(event.startTime); setEndTime(event.endTime);
      setType(event.type); setDescription(event.description || ''); setProjectId(event.projectId || '');
    } else {
      setTitle(''); setDate(defaultDate); setStartTime('11:30'); setEndTime('12:00');
      setType('meeting'); setDescription(''); setProjectId('');
    }
  }, [event, defaultDate]);

  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || startTime >= endTime) return;
    onSaveEvent({ id: event?.id || `event-${Date.now()}`, title: title.trim(), date, startTime, endTime, type, description: description.trim() || undefined, projectId: projectId || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-black/[0.08]">
        <div className="flex items-center justify-between mb-4"><h2 className="font-heading font-bold text-xl text-[#171717]">{event ? 'Edit Event' : 'New Fixed Event'}</h2><button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[#171717]/60 hover:bg-black/5" aria-label="Close"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Title *</label><input type="text" placeholder="e.g. Client review call" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-semibold outline-none focus:border-[#07549A]" /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-2.5 py-1.5 rounded-xl border border-black/15 text-xs font-semibold outline-none" /></div><div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Type</label><select value={type} onChange={e => setType(e.target.value as EventType)} className="w-full px-2.5 py-1.5 rounded-xl border border-black/15 text-xs font-semibold outline-none bg-white"><option value="meeting">Meeting</option><option value="lunch">Lunch</option><option value="break">Break</option><option value="appointment">Appointment</option><option value="blocked">Blocked Time</option></select></div></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-2.5 py-1.5 rounded-xl border border-black/15 text-xs font-semibold outline-none" /></div><div><label className="block text-xs font-bold text-[#171717]/80 mb-1">End Time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-2.5 py-1.5 rounded-xl border border-black/15 text-xs font-semibold outline-none" /></div></div>
          {startTime >= endTime && <p className="text-xs text-rose-600">End time must be after start time.</p>}
          <div><label className="block text-xs font-bold text-[#171717]/80 mb-1">Project (optional)</label><select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-2.5 py-1.5 rounded-xl border border-black/15 text-xs font-semibold outline-none bg-white"><option value="">(No project)</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="pt-2 flex items-center justify-between gap-2">
            {event && onDeleteEvent ? <button type="button" onClick={() => { onDeleteEvent(event.id); onClose(); }} className="px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Delete</button> : <div />}
            <div className="flex items-center gap-2"><button type="button" onClick={onClose} className="px-3 py-2 text-xs font-semibold text-[#171717]/60">Cancel</button><button type="submit" disabled={startTime >= endTime} className="px-4 py-2.5 rounded-xl bg-[#07549A] text-white text-xs font-semibold hover:bg-[#053C6E] disabled:opacity-50">Save Event</button></div>
          </div>
        </form>
      </div>
    </div>
  );
};
