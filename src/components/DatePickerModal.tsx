import React from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { formatDateKey, parseDateKey, addDays } from '../utils/dateUtils';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  scheduledDates: string[];
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  scheduledDates,
}) => {
  if (!isOpen) return null;

  const todayKey = formatDateKey(new Date());
  const tomorrowKey = addDays(todayKey, 1);

  // Quick picker dates: today, tomorrow, and next 7 days
  const upcomingDays = Array.from({ length: 8 }).map((_, i) => addDays(todayKey, i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-black/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#07549A]" />
            <h2 className="font-heading font-bold text-xl text-[#171717]">Select Date</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#171717]/60 hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom date input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#171717]/70 mb-1">
            Pick specific calendar date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                onSelectDate(e.target.value);
                onClose();
              }
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm font-semibold outline-none focus:border-[#07549A]"
          />
        </div>

        {/* Quick select list */}
        <div>
          <label className="block text-xs font-bold text-[#171717]/70 mb-2">
            Upcoming working schedule
          </label>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {upcomingDays.map((dateKey) => {
              const d = parseDateKey(dateKey);
              const isSelected = dateKey === selectedDate;
              const hasWork = scheduledDates.includes(dateKey);

              const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = d.getDate();
              const month = d.toLocaleDateString('en-US', { month: 'short' });

              let tag = '';
              if (dateKey === todayKey) tag = 'Today';
              else if (dateKey === tomorrowKey) tag = 'Tomorrow';

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => {
                    onSelectDate(dateKey);
                    onClose();
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs transition-all ${
                    isSelected
                      ? 'bg-[#07549A] text-white font-bold'
                      : 'bg-[#F8F9FA] hover:bg-[#F4F5F0] text-[#171717] font-semibold border border-black/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-left">{weekday}, {dayNum} {month}</span>
                    {tag && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#171717]/70'
                        }`}
                      >
                        {tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasWork && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#E2E4D8] text-[#171717]'
                        }`}
                      >
                        Tasks planned
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
