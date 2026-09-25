import React from 'react';
import { MessageSquare, Folder, Scan, Globe, Search, Grid, Settings } from 'lucide-react';
import { playHudBeep } from '../utils/speech';

export type DockTab = 'chat' | 'files' | 'vision' | 'web' | 'search' | 'all_apps' | 'settings';

interface DockBarProps {
  activeTab: DockTab;
  onSelectTab: (tab: DockTab) => void;
  onFocusCommand: () => void;
}

export const DockBar: React.FC<DockBarProps> = ({
  activeTab,
  onSelectTab,
  onFocusCommand,
}) => {
  const dockItems: { id: DockTab; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'files', label: 'Files', icon: <Folder className="w-4 h-4" /> },
    { id: 'vision', label: 'Vision', icon: <Scan className="w-4 h-4" /> },
    { id: 'web', label: 'Web', icon: <Globe className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'all_apps', label: 'All Apps', icon: <Grid className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <footer className="h-16 w-full border-t border-teal-500/15 bg-[#050c0f]/95 px-6 flex items-center justify-between z-30 select-none">
      {/* Left indicator */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-teal-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          <span>All yours.</span>
        </div>
        <span className="font-mono-code text-[9px] tracking-[0.2em] text-teal-500/50 uppercase mt-0.5">
          DENVER WORKSPACE
        </span>
      </div>

      {/* Center floating dock */}
      <nav className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-2xl bg-[#081820]/90 border border-teal-500/25 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {dockItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playHudBeep('click');
                onSelectTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 sm:px-3.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-500/20 text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.3)] border border-teal-400/40'
                  : 'text-teal-400/60 hover:text-teal-200 hover:bg-[#0c222c]'
              }`}
            >
              <div className="mb-0.5">{item.icon}</div>
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right shortcut guide */}
      <div
        onClick={onFocusCommand}
        className="flex items-center gap-1.5 text-xs text-teal-400/60 font-mono cursor-pointer hover:text-teal-300 transition-colors"
      >
        <kbd className="px-1.5 py-0.5 rounded bg-[#091820] border border-teal-500/25 text-[10px] text-teal-300">
          Ctrl
        </kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-[#091820] border border-teal-500/25 text-[10px] text-teal-300">
          K
        </kbd>
        <span className="text-[11px] ml-1">Focus command</span>
      </div>
    </footer>
  );
};
