import React from 'react';
import { Home, FolderClosed, Settings } from 'lucide-react';

export type TabType = 'today' | 'projects' | 'space';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-black/[0.08] max-w-lg mx-auto">
      <div className="grid grid-cols-3 h-16 items-center px-4">
        {/* Tab 1: Today */}
        <button
          onClick={() => onChangeTab('today')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'today' ? 'text-[#07549A]' : 'text-[#171717]/60 hover:text-[#171717]'
          }`}
        >
          <Home
            className={`w-5 h-5 transition-transform ${activeTab === 'today' ? 'scale-105 stroke-[2.5]' : 'stroke-[1.75]'}`}
          />
          <span
            className={`text-[11px] mt-1 font-medium tracking-tight ${
              activeTab === 'today' ? 'font-semibold text-[#07549A]' : 'text-[#171717]/70'
            }`}
          >
            Today
          </span>
        </button>

        {/* Tab 2: Projects */}
        <button
          onClick={() => onChangeTab('projects')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'projects' ? 'text-[#07549A]' : 'text-[#171717]/60 hover:text-[#171717]'
          }`}
        >
          <FolderClosed
            className={`w-5 h-5 transition-transform ${activeTab === 'projects' ? 'scale-105 stroke-[2.5]' : 'stroke-[1.75]'}`}
          />
          <span
            className={`text-[11px] mt-1 font-medium tracking-tight ${
              activeTab === 'projects' ? 'font-semibold text-[#07549A]' : 'text-[#171717]/70'
            }`}
          >
            Projects
          </span>
        </button>

        {/* Tab 3: Your Space */}
        <button
          onClick={() => onChangeTab('space')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'space' ? 'text-[#07549A]' : 'text-[#171717]/60 hover:text-[#171717]'
          }`}
        >
          <Settings
            className={`w-5 h-5 transition-transform ${activeTab === 'space' ? 'scale-105 stroke-[2.5]' : 'stroke-[1.75]'}`}
          />
          <span
            className={`text-[11px] mt-1 font-medium tracking-tight ${
              activeTab === 'space' ? 'font-semibold text-[#07549A]' : 'text-[#171717]/70'
            }`}
          >
            Your Space
          </span>
        </button>
      </div>
    </nav>
  );
};
