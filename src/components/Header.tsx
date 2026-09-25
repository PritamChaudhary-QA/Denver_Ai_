import React, { useState, useEffect } from 'react';
import { Bell, Hand, Grid, Settings } from 'lucide-react';
import { playHudBeep } from '../utils/speech';

interface HeaderProps {
  onOpenNotifications: () => void;
  onToggleVoiceWake: () => void;
  isVoiceWakeActive: boolean;
  onOpenAllApps: () => void;
  onOpenSettings: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onToggleVoiceWake,
  isVoiceWakeActive,
  onOpenAllApps,
  onOpenSettings,
  unreadNotificationsCount,
}) => {
  const [timeStr, setTimeStr] = useState<string>('22:30:22');
  const [dateStr, setDateStr] = useState<string>('FRI, 25 SEPT, 2026');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];
      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      setDateStr(`${dayName},  ${dayNum} ${monthName},  ${year}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 w-full border-b border-teal-500/15 bg-[#050c0f]/90 backdrop-blur-md px-5 flex items-center justify-between z-30 select-none">
      {/* Left branding */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#08181c] border border-teal-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.25)]">
            <span className="font-hud font-bold text-teal-300 text-xl tracking-wider">D</span>
          </div>
          <div className="flex flex-col">
            <span className="font-hud font-bold tracking-[0.28em] text-white text-base leading-none">DENVER</span>
            <span className="font-mono-code text-[9px] tracking-[0.22em] text-teal-400/70 uppercase mt-1">PERSONAL INTELLIGENCE</span>
          </div>
        </div>

        {/* Center-left status pill */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#08171c]/60 border border-teal-500/20 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-teal-200/90 font-medium">Workspace ready</span>
          <span className="text-teal-500/40 font-mono">|</span>
          <span className="text-teal-400/70 font-mono tracking-wider text-[11px]">LOCAL AGENT</span>
        </div>
      </div>

      {/* Right widgets */}
      <div className="flex items-center gap-4">
        {/* Real-time digital clock and date */}
        <div className="flex flex-col items-end mr-2">
          <span className="font-mono-code text-teal-300 text-sm tracking-widest font-semibold">{timeStr}</span>
          <span className="font-mono-code text-[10px] tracking-wider text-teal-500/60 uppercase">{dateStr}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => {
              playHudBeep('click');
              onOpenNotifications();
            }}
            title="Notifications & Tasks"
            className="relative w-9 h-9 rounded-lg bg-[#0a171d] hover:bg-[#0f242d] border border-teal-500/20 hover:border-teal-400/40 flex items-center justify-center text-teal-300/80 hover:text-teal-200 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 text-[#050b0e] text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Voice wake toggle / Hand icon */}
          <button
            onClick={() => {
              playHudBeep(isVoiceWakeActive ? 'click' : 'wake');
              onToggleVoiceWake();
            }}
            title={isVoiceWakeActive ? "Voice Wake: Active (Listening for 'Denver')" : "Voice Wake: Inactive"}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isVoiceWakeActive
                ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-[0_0_12px_rgba(45,212,191,0.4)]'
                : 'bg-[#0a171d] hover:bg-[#0f242d] border-teal-500/20 text-teal-300/80 hover:text-teal-200'
            }`}
          >
            <Hand className="w-4 h-4" />
          </button>

          {/* Grid / All Apps Launcher */}
          <button
            onClick={() => {
              playHudBeep('click');
              onOpenAllApps();
            }}
            title="Windows App Launcher & Multitasking"
            className="w-9 h-9 rounded-lg bg-[#0a171d] hover:bg-[#0f242d] border border-teal-500/20 hover:border-teal-400/40 flex items-center justify-center text-teal-300/80 hover:text-teal-200 transition-all cursor-pointer"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Settings / Gear */}
          <button
            onClick={() => {
              playHudBeep('click');
              onOpenSettings();
            }}
            title="Settings & E2E Encrypted Vault"
            className="w-9 h-9 rounded-lg bg-[#0a171d] hover:bg-[#0f242d] border border-teal-500/20 hover:border-teal-400/40 flex items-center justify-center text-teal-300/80 hover:text-teal-200 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User profile avatar 'P' */}
          <div
            title="Pritam (User Administrator)"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#122830] to-[#081418] border border-teal-500/30 flex items-center justify-center text-teal-200 font-hud font-bold text-sm shadow-[0_0_10px_rgba(45,212,191,0.2)] ml-1"
          >
            P
          </div>
        </div>
      </div>
    </header>
  );
};
