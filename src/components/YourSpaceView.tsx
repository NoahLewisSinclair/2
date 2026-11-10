import React, { useState } from 'react';
import {
  Calendar,
  Zap,
  Clock,
  Palette,
  Download,
  RotateCcw,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { AppSettings } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface YourSpaceViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportData: () => void;
  onResetData: () => void;
  onClearData: () => void;
}

export const YourSpaceView: React.FC<YourSpaceViewProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onResetData,
  onClearData,
}) => {
  const [activeSection, setActiveSection] = useState<
    'overview' | 'schedule' | 'scheduling' | 'focus' | 'appearance'
  >('overview');

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleWorkingDay = (dayIndex: number) => {
    const currentDays = settings.workSchedule.workingDays;
    const nextDays = currentDays.includes(dayIndex)
      ? currentDays.filter((d) => d !== dayIndex)
      : [...currentDays, dayIndex].sort();

    onUpdateSettings({
      ...settings,
      workSchedule: {
        ...settings.workSchedule,
        workingDays: nextDays,
      },
    });
    showToast('Work schedule updated');
  };

  const updateDayHour = (
    dayIndex: number,
    field: 'start' | 'end',
    val: string
  ) => {
    const existing = settings.workSchedule.dayHours[dayIndex] || {
      start: '09:00',
      end: '17:00',
      enabled: true,
    };
    onUpdateSettings({
      ...settings,
      workSchedule: {
        ...settings.workSchedule,
        dayHours: {
          ...settings.workSchedule.dayHours,
          [dayIndex]: {
            ...existing,
            [field]: val,
          },
        },
      },
    });
  };

  return (
    <div className="pb-28 px-5 pt-4 max-w-lg mx-auto">
      {/* Toast Feedback */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {message}
        </div>
      )}

      {/* Header matching Screen 8 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-3xl text-[#171717] tracking-tight">
          Your Space
        </h1>
      </div>

      {activeSection === 'overview' ? (
        <div className="space-y-3">
          {/* Section 1: Work Schedule */}
          <button
            onClick={() => setActiveSection('schedule')}
            className="w-full p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs hover:shadow-sm transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F5F0] flex items-center justify-center text-[#171717]/80 group-hover:bg-[#07549A]/10 group-hover:text-[#07549A] transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#171717] group-hover:text-[#07549A] transition-colors">
                  Work Schedule
                </h3>
                <p className="text-xs text-[#171717]/60 mt-0.5">Hours, days and breaks</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#171717]/30 group-hover:text-[#171717]/70 transition-colors" />
          </button>

          {/* Section 2: Scheduling */}
          <button
            onClick={() => setActiveSection('scheduling')}
            className="w-full p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs hover:shadow-sm transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F5F0] flex items-center justify-center text-[#171717]/80 group-hover:bg-[#07549A]/10 group-hover:text-[#07549A] transition-colors">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#171717] group-hover:text-[#07549A] transition-colors">
                  Scheduling
                </h3>
                <p className="text-xs text-[#171717]/60 mt-0.5">Priorities and auto-planning</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#171717]/30 group-hover:text-[#171717]/70 transition-colors" />
          </button>

          {/* Section 3: Focus */}
          <button
            onClick={() => setActiveSection('focus')}
            className="w-full p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs hover:shadow-sm transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F5F0] flex items-center justify-center text-[#171717]/80 group-hover:bg-[#07549A]/10 group-hover:text-[#07549A] transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#171717] group-hover:text-[#07549A] transition-colors">
                  Focus
                </h3>
                <p className="text-xs text-[#171717]/60 mt-0.5">Timer, auto-next and sounds</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#171717]/30 group-hover:text-[#171717]/70 transition-colors" />
          </button>

          {/* Section 4: Appearance */}
          <button
            onClick={() => setActiveSection('appearance')}
            className="w-full p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs hover:shadow-sm transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F5F0] flex items-center justify-center text-[#171717]/80 group-hover:bg-[#07549A]/10 group-hover:text-[#07549A] transition-colors">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#171717] group-hover:text-[#07549A] transition-colors">
                  Appearance
                </h3>
                <p className="text-xs text-[#171717]/60 mt-0.5">Light, dark and accent colour</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#171717]/30 group-hover:text-[#171717]/70 transition-colors" />
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (
            <div className="p-4 rounded-3xl bg-[#07549A]/10 border border-[#07549A]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#07549A] text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#07549A]">Install Dayframe</h4>
                  <p className="text-xs text-[#171717]/70">Add to home screen for offline focus</p>
                </div>
              </div>
              {isInstallable ? (
                <button onClick={install} className="px-3 py-1.5 rounded-xl bg-[#07549A] text-white text-xs font-semibold hover:bg-[#053C6E] transition-colors">
                  Install
                </button>
              ) : isIOS ? (
                <button onClick={() => setShowIOSGuide(true)} className="px-3 py-1.5 rounded-xl bg-[#07549A] text-white text-xs font-semibold hover:bg-[#053C6E] transition-colors">
                  iOS Guide
                </button>
              ) : null}
            </div>
          )}

          {/* iOS Guide Modal */}
          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl text-center">
                <h3 className="font-heading text-lg font-bold text-[#171717]">Install on iPhone or iPad</h3>
                <p className="mt-3 text-xs text-[#171717]/70 leading-relaxed">
                  1. Tap the <strong>Share</strong> button in Safari's bottom toolbar.<br />
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                  3. Launch Dayframe directly from your home screen.
                </p>
                <button onClick={() => setShowIOSGuide(false)} className="mt-5 w-full rounded-2xl bg-[#07549A] text-white py-2.5 text-xs font-semibold">Got it</button>
              </div>
            </div>
          )}

          {/* Data & Backup Options */}
          <div className="pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]/50 px-2 mb-2">Data & Backup</h4>
            <div className="space-y-2">
              <button onClick={onExportData} className="w-full p-3.5 rounded-2xl bg-white border border-black/[0.05] hover:bg-[#F4F5F0] transition-colors flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#171717]"><Download className="w-4 h-4 text-[#171717]/60" /><span>Export JSON Backup</span></div><span className="text-xs text-[#171717]/40">Download</span>
              </button>
              <button onClick={() => { if (window.confirm('Reset to initial sample projects and tasks?')) { onResetData(); showToast('Reset to initial sample data'); } }} className="w-full p-3.5 rounded-2xl bg-white border border-black/[0.05] hover:bg-[#F4F5F0] transition-colors flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#171717]"><RotateCcw className="w-4 h-4 text-[#171717]/60" /><span>Re-seed Sample Data</span></div><span className="text-xs text-[#171717]/40">Reset</span>
              </button>
              <button onClick={() => { if (window.confirm('Clear all tasks, projects, and custom schedule? This cannot be undone.')) { onClearData(); showToast('All local data cleared'); } }} className="w-full p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 hover:bg-rose-50 transition-colors flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-rose-600"><Trash2 className="w-4 h-4" /><span>Clear All Local Data</span></div><span className="text-xs text-rose-500">Erase</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sub-view: Work Schedule */}
      {activeSection === 'schedule' && (
        <div className="space-y-4">
          <button onClick={() => setActiveSection('overview')} className="flex items-center gap-1.5 text-xs font-semibold text-[#07549A] hover:underline mb-2">‹ Back to Your Space</button>
          <div className="p-4 rounded-3xl bg-white border border-black/[0.06]">
            <h3 className="font-heading font-bold text-base text-[#171717] mb-1">Active Working Days</h3>
            <p className="text-xs text-[#171717]/60 mb-3">The automatic scheduler places tasks only on your working days.</p>
            <div className="flex items-center justify-between gap-1.5">
              {dayNames.map((name, idx) => { const isActive = settings.workSchedule.workingDays.includes(idx); return (
                <button key={idx} type="button" onClick={() => toggleWorkingDay(idx)} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-[#07549A] text-white shadow-xs' : 'bg-[#F4F5F0] text-[#171717]/50 hover:bg-[#E2E4D8]'}`}>{name}</button>
              ); })}
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-white border border-black/[0.06]">
            <h3 className="font-heading font-bold text-base text-[#171717] mb-1">Daily Working Hours</h3>
            <div className="space-y-2.5 mt-3">
              {[1, 2, 3, 4, 5].map((d) => {
                const config = settings.workSchedule.dayHours[d] || { start: '09:00', end: '17:00', enabled: true };
                return <div key={d} className="flex items-center justify-between text-xs"><span className="font-semibold text-[#171717] w-12">{dayNames[d]}</span><div className="flex items-center gap-2"><input type="time" value={config.start} onChange={(e) => updateDayHour(d, 'start', e.target.value)} className="px-2 py-1 bg-[#F8F9FA] rounded-lg border border-black/10 font-mono font-semibold" /><span>to</span><input type="time" value={config.end} onChange={(e) => updateDayHour(d, 'end', e.target.value)} className="px-2 py-1 bg-[#F8F9FA] rounded-lg border border-black/10 font-mono font-semibold" /></div></div>;
              })}
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-white border border-black/[0.06]">
            <h3 className="font-heading font-bold text-base text-[#171717] mb-1">Protected Lunch Break</h3>
            <p className="text-xs text-[#171717]/60 mb-3">The scheduler never overlaps this window with work.</p>
            <div className="flex items-center justify-between text-xs"><span className="font-semibold">Lunch window:</span><div className="flex items-center gap-2"><input type="time" value={settings.workSchedule.lunchBreak.start} onChange={(e) => onUpdateSettings({ ...settings, workSchedule: { ...settings.workSchedule, lunchBreak: { ...settings.workSchedule.lunchBreak, start: e.target.value } } })} className="px-2 py-1 bg-[#F8F9FA] rounded-lg border border-black/10 font-mono font-semibold" /><span>to</span><input type="time" value={settings.workSchedule.lunchBreak.end} onChange={(e) => onUpdateSettings({ ...settings, workSchedule: { ...settings.workSchedule, lunchBreak: { ...settings.workSchedule.lunchBreak, end: e.target.value } } })} className="px-2 py-1 bg-[#F8F9FA] rounded-lg border border-black/10 font-mono font-semibold" /></div></div>
          </div>
        </div>
      )}

      {/* Sub-view: Scheduling Preferences */}
      {activeSection === 'scheduling' && (
        <div className="space-y-4">
          <button onClick={() => setActiveSection('overview')} className="flex items-center gap-1.5 text-xs font-semibold text-[#07549A] hover:underline mb-2">‹ Back to Your Space</button>
          <div className="p-4 rounded-3xl bg-white border border-black/[0.06] space-y-3">
            <h3 className="font-heading font-bold text-base text-[#171717]">Automatic scheduling</h3>
            <p className="text-xs leading-relaxed text-[#171717]/65">Dayframe schedules high-priority work first, considers deadlines and uses your working hours to plan across future working days.</p>
            <div className="flex items-center gap-2 rounded-xl bg-[#E2E4D8]/60 p-3"><span className="w-2 h-2 rounded-full bg-[#07549A]" /><span className="text-xs font-semibold text-[#171717]">Rolling rescheduling is always on</span></div>
            <p className="text-[11px] text-[#171717]/55">When work is completed early or a task runs late, Dayframe automatically updates the remaining timeline. Fixed events and breaks stay in place.</p>
          </div>
        </div>
      )}

      {/* Sub-view: Focus Preferences */}
      {activeSection === 'focus' && (
        <div className="space-y-4">
          <button onClick={() => setActiveSection('overview')} className="flex items-center gap-1.5 text-xs font-semibold text-[#07549A] hover:underline mb-2">‹ Back to Your Space</button>
          <div className="p-4 rounded-3xl bg-white border border-black/[0.06] flex items-center justify-between"><div><h4 className="text-sm font-bold text-[#171717]">Completion Chime</h4><p className="text-xs text-[#171717]/60 mt-0.5">Play subtle rising tone when completing a step or task.</p></div><input type="checkbox" checked={settings.focus.soundEnabled} onChange={(e) => onUpdateSettings({ ...settings, focus: { ...settings.focus, soundEnabled: e.target.checked } })} className="w-5 h-5 accent-[#07549A]" /></div>
          <div className="p-4 rounded-3xl bg-white border border-black/[0.06] flex items-center justify-between"><div><h4 className="text-sm font-bold text-[#171717]">Minute Pulse Tick</h4><p className="text-xs text-[#171717]/60 mt-0.5">Gentle audio tick every elapsed minute during Focus Mode.</p></div><input type="checkbox" checked={settings.focus.tickSound} onChange={(e) => onUpdateSettings({ ...settings, focus: { ...settings.focus, tickSound: e.target.checked } })} className="w-5 h-5 accent-[#07549A]" /></div>
        </div>
      )}

      {/* Sub-view: Appearance */}
      {activeSection === 'appearance' && (
        <div className="space-y-4">
          <button onClick={() => setActiveSection('overview')} className="flex items-center gap-1.5 text-xs font-semibold text-[#07549A] hover:underline mb-2">‹ Back to Your Space</button>
          <div className="p-4 rounded-3xl bg-white border border-black/[0.06]"><h3 className="font-heading font-bold text-base text-[#171717] mb-3">Theme Mode</h3><div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onUpdateSettings({ ...settings, theme: 'light' })} className={`p-3 rounded-2xl border text-center transition-all ${settings.theme === 'light' ? 'border-[#07549A] bg-[#07549A]/5 font-bold text-[#07549A]' : 'border-black/5 bg-[#F8F9FA] text-[#171717]/70 font-semibold'}`}>Dayframe Light</button>
            <button type="button" onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })} className={`p-3 rounded-2xl border text-center transition-all ${settings.theme === 'dark' ? 'border-[#07549A] bg-[#07549A]/5 font-bold text-[#07549A]' : 'border-black/5 bg-[#F8F9FA] text-[#171717]/70 font-semibold'}`}>Charcoal Dark</button>
          </div></div>
        </div>
      )}
    </div>
  );
};
