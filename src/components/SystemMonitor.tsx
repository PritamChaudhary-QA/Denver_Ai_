import React, { useState, useEffect } from 'react';
import { Activity, Wrench, ChevronLeft, Cpu, HardDrive, Zap, Wifi, ArrowDown, ArrowUp, Link2, ExternalLink, Volume2, Sun, Terminal, AppWindow, Folder } from 'lucide-react';
import { SystemTelemetry, ConnectionStatus } from '../types/denver';
import { playHudBeep } from '../utils/speech';

interface SystemMonitorProps {
  telemetry: SystemTelemetry;
  connections: ConnectionStatus;
  onOpenConnectionsModal: () => void;
  onQuickLaunch: (appName: string) => void;
  onOpenFileWorkspace: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({
  telemetry,
  connections,
  onOpenConnectionsModal,
  onQuickLaunch,
  onOpenFileWorkspace,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'tools'>('monitor');
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 14, 18, 16, 22, 19, 15, 20, 18, 24, 19, 18]);
  const [volume, setVolume] = useState<number>(75);
  const [brightness, setBrightness] = useState<number>(90);

  // Keep sparkline moving with new CPU telemetry
  useEffect(() => {
    setCpuHistory(prev => [...prev.slice(1), telemetry.cpu]);
  }, [telemetry.cpu]);

  if (isCollapsed) {
    return (
      <div className="w-12 h-full border-r border-teal-500/15 bg-[#071115]/90 flex flex-col items-center py-4 justify-between select-none">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg bg-[#0d1e25] border border-teal-500/20 flex items-center justify-center text-teal-400 hover:text-teal-200 cursor-pointer"
          title="Expand Monitor"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
        <div className="flex flex-col gap-4 text-teal-400/60">
          <Activity className="w-4 h-4 cursor-pointer hover:text-teal-300" onClick={onToggleCollapse} />
          <Cpu className="w-4 h-4 cursor-pointer hover:text-teal-300" onClick={onToggleCollapse} />
        </div>
      </div>
    );
  }

  // Render SVG Sparkline
  const renderSparkline = (data: number[], maxVal = 100) => {
    const width = 140;
    const height = 28;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (Math.min(val, maxVal) / maxVal) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <aside className="w-72 xl:w-80 h-full border-r border-teal-500/15 bg-[#061014]/95 flex flex-col select-none overflow-y-auto shrink-0 z-20">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-teal-500/15">
        <div className="flex items-center gap-5 text-sm font-medium">
          <button
            onClick={() => {
              playHudBeep('click');
              setActiveTab('monitor');
            }}
            className={`flex items-center gap-1.5 pb-1 relative transition-colors cursor-pointer ${
              activeTab === 'monitor' ? 'text-teal-300 font-semibold' : 'text-teal-400/50 hover:text-teal-300/80'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Monitor</span>
            {activeTab === 'monitor' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]" />
            )}
          </button>

          <button
            onClick={() => {
              playHudBeep('click');
              setActiveTab('tools');
            }}
            className={`flex items-center gap-1.5 pb-1 relative transition-colors cursor-pointer ${
              activeTab === 'tools' ? 'text-teal-300 font-semibold' : 'text-teal-400/50 hover:text-teal-300/80'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools</span>
            {activeTab === 'tools' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]" />
            )}
          </button>
        </div>

        <button
          onClick={onToggleCollapse}
          className="text-teal-400/40 hover:text-teal-300 transition-colors p-1"
          title="Collapse Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {activeTab === 'monitor' ? (
        <div className="p-4 flex flex-col gap-4">
          {/* System Overview Card */}
          <div className="p-3.5 rounded-xl bg-[#09161c]/80 border border-teal-500/20 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-hud font-bold uppercase tracking-wider text-teal-200">System overview</span>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded bg-teal-950/80 text-teal-300 border border-teal-500/40">
                ONLINE
              </span>
            </div>

            {/* Desktop workspace item */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0d1e26]/60 border border-teal-500/15 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <AppWindow className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-teal-100 truncate">Desktop workspace</div>
                <div className="text-[10px] text-teal-400/70 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>Denver Local Core active</span>
                </div>
              </div>
            </div>

            {/* Metric 1: CPU */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-teal-400/70 flex items-center gap-1.5 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-teal-400" /> CPU
                </span>
                <span className="font-mono-code font-bold text-teal-200 text-sm">{telemetry.cpu}%</span>
              </div>
              <div className="h-7 w-full flex items-center justify-center bg-[#071318]/70 rounded border border-teal-500/10 px-2">
                {renderSparkline(cpuHistory)}
              </div>
            </div>

            {/* Metric 2: Memory */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-teal-400/70 flex items-center gap-1.5 font-medium">
                  <HardDrive className="w-3.5 h-3.5 text-teal-400" /> Memory
                </span>
                <span className="font-mono-code text-teal-200 text-xs">
                  {telemetry.memory.usedGB} / {telemetry.memory.totalGB} GB
                </span>
              </div>
              <div className="w-full bg-[#061116] rounded-full h-1.5 overflow-hidden border border-teal-500/20">
                <div
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full transition-all duration-500"
                  style={{ width: `${telemetry.memory.percentage}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-teal-400/50 mt-1 block">Live telemetry active</span>
            </div>

            {/* Metric 3: GPU */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-teal-400/70 flex items-center gap-1.5 font-medium">
                  <Zap className="w-3.5 h-3.5 text-teal-400" /> GPU
                </span>
                <span className="font-mono-code font-bold text-teal-200 text-xs">{telemetry.gpu}%</span>
              </div>
              <div className="w-full bg-[#061116] rounded-full h-1.5 overflow-hidden border border-teal-500/20">
                <div
                  className="bg-teal-400 h-full transition-all duration-500 shadow-[0_0_8px_#2dd4bf]"
                  style={{ width: `${telemetry.gpu}%` }}
                />
              </div>
            </div>

            {/* Metric 4: Network */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-teal-400/70 flex items-center gap-1.5 font-medium">
                  <Wifi className="w-3.5 h-3.5 text-teal-400" /> Network
                </span>
                <span className="font-mono-code text-teal-200 text-xs font-semibold">
                  {(telemetry.network.downloadMbps + telemetry.network.uploadMbps).toFixed(1)} Mbps
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-teal-400/70 mt-1 px-1">
                <span className="flex items-center gap-1">
                  <ArrowDown className="w-3 h-3 text-emerald-400" />
                  {telemetry.network.downloadMbps} Mbps
                </span>
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3 text-cyan-400" />
                  {telemetry.network.uploadMbps} Mbps
                </span>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-teal-500/10 text-[10px] font-mono text-teal-400/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Denver backend connected</span>
            </div>
          </div>

          {/* Connections Card */}
          <div className="p-3.5 rounded-xl bg-[#09161c]/80 border border-teal-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-hud font-bold uppercase tracking-wider text-teal-200">Connections</span>
              <Link2 className="w-3.5 h-3.5 text-teal-400/60" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-teal-400/70">AI model</span>
                <span className="font-mono text-[11px] text-emerald-400 font-medium">
                  Online (Gemini 3.8)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-teal-400/70">Desktop agent</span>
                <span className="font-mono text-[11px] text-teal-300 font-medium">
                  {connections.desktopAgent === 'connected' ? 'Connected (Bridge)' : 'Active (Emulated)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-teal-400/70">Microphone</span>
                <span className="font-mono text-[11px] text-teal-300 font-medium">
                  {connections.microphone === 'listening' ? 'Listening...' : 'Active (Ready)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playHudBeep('click');
                onOpenConnectionsModal();
              }}
              className="mt-4 w-full py-1.5 px-3 rounded-lg bg-teal-950/40 hover:bg-teal-900/50 border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Manage connections</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Tools Tab */
        <div className="p-4 flex flex-col gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#09161c]/80 border border-teal-500/20">
            <span className="text-xs font-hud font-bold uppercase tracking-wider text-teal-200 block mb-3">
              OS Controls
            </span>

            {/* Volume control */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-teal-400/70 mb-1.5">
                <span className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> Volume</span>
                <span className="font-mono text-teal-200">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-teal-400 h-1 bg-[#061116] rounded cursor-pointer"
              />
            </div>

            {/* Brightness control */}
            <div className="mb-2">
              <div className="flex justify-between items-center text-teal-400/70 mb-1.5">
                <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Brightness</span>
                <span className="font-mono text-teal-200">{brightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-teal-400 h-1 bg-[#061116] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Launchers */}
          <div className="p-3.5 rounded-xl bg-[#09161c]/80 border border-teal-500/20">
            <span className="text-xs font-hud font-bold uppercase tracking-wider text-teal-200 block mb-3">
              Quick Launch
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onQuickLaunch('Notepad')}
                className="p-2 rounded-lg bg-[#0d1e26] hover:bg-[#122b37] border border-teal-500/20 text-teal-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <AppWindow className="w-3.5 h-3.5 text-teal-400" />
                <span>Notepad</span>
              </button>
              <button
                onClick={() => onQuickLaunch('PowerShell')}
                className="p-2 rounded-lg bg-[#0d1e26] hover:bg-[#122b37] border border-teal-500/20 text-teal-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Terminal</span>
              </button>
              <button
                onClick={() => onQuickLaunch('VS Code')}
                className="p-2 rounded-lg bg-[#0d1e26] hover:bg-[#122b37] border border-teal-500/20 text-teal-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>VS Code</span>
              </button>
              <button
                onClick={onOpenFileWorkspace}
                className="p-2 rounded-lg bg-[#0d1e26] hover:bg-[#122b37] border border-teal-500/20 text-teal-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Explorer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
