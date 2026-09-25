import React, { useState } from 'react';
import { X, Terminal, FileText, Calculator, Globe, Code, Music, Activity, Play, Square, Volume2, Sun, Lock, Moon, CheckCircle2 } from 'lucide-react';
import { WindowsAppItem } from '../../types/denver';
import { playHudBeep } from '../../utils/speech';

interface AllAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: WindowsAppItem[];
  onLaunchApp: (app: WindowsAppItem) => void;
  onKillApp: (appId: string) => void;
  isDesktopAgentOnline: boolean;
  onExecuteCommand: (cmd: string) => void;
}

export const AllAppsModal: React.FC<AllAppsModalProps> = ({
  isOpen,
  onClose,
  apps,
  onLaunchApp,
  onKillApp,
  isDesktopAgentOnline,
  onExecuteCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'running' | 'terminal' | 'calc'>('all');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Windows PowerShell v7.4.1 (x64)',
    'Denver Personal Intelligence Bridge v0.1 initialized.',
    'System status: Ready for user automation commands.',
  ]);

  // Mini calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');

  if (!isOpen) return null;

  const handleRunTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalLogs(prev => [...prev, `PS C:\\Users\\Pritam> ${cmd}`]);
    playHudBeep('click');

    // Simulate or execute command
    if (cmd.toLowerCase() === 'cls' || cmd.toLowerCase() === 'clear') {
      setTerminalLogs(['Windows PowerShell v7.4.1 (x64)']);
    } else if (cmd.toLowerCase().includes('dir') || cmd.toLowerCase().includes('ls')) {
      setTerminalLogs(prev => [
        ...prev,
        'Mode                 LastWriteTime         Length Name',
        '----                 -------------         ------ ----',
        'd-----        25/09/2026     10:20                Denver_Projects',
        'd-----        25/09/2026     09:45                Documents',
        '-a----        25/09/2026     10:30           1420 denver_agent.py',
        '-a----        25/09/2026     10:15            450 secure_vault.aes',
      ]);
    } else {
      setTerminalLogs(prev => [...prev, `Denver Agent: Executed "${cmd}" successfully.`]);
      onExecuteCommand(cmd);
    }
    setTerminalInput('');
  };

  const handleCalcBtn = (val: string) => {
    playHudBeep('click');
    if (val === 'C') {
      setCalcDisplay('0');
    } else if (val === '=') {
      try {
        // Safe evaluation
        const sanitized = calcDisplay.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcDisplay(String(res));
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay(prev => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl h-[80vh] rounded-2xl bg-[#071318] border border-teal-500/30 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-teal-500/20 flex items-center justify-between bg-[#0a1820]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-teal-100 text-sm tracking-wide">WINDOWS OS AUTOMATION & APPS</span>
              <div className="text-[10px] font-mono text-teal-400/60">
                {isDesktopAgentOnline ? 'Direct Windows Agent Connected' : 'Denver Multitasking Workspace'}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                activeTab === 'all' ? 'bg-teal-400/20 text-teal-200 border border-teal-400/30' : 'text-teal-400/60'
              }`}
            >
              All Apps
            </button>
            <button
              onClick={() => setActiveTab('running')}
              className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                activeTab === 'running' ? 'bg-teal-400/20 text-teal-200 border border-teal-400/30' : 'text-teal-400/60'
              }`}
            >
              Processes ({apps.filter(a => a.isRunning).length})
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                activeTab === 'terminal' ? 'bg-teal-400/20 text-teal-200 border border-teal-400/30' : 'text-teal-400/60'
              }`}
            >
              PowerShell
            </button>
            <button
              onClick={() => setActiveTab('calc')}
              className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                activeTab === 'calc' ? 'bg-teal-400/20 text-teal-200 border border-teal-400/30' : 'text-teal-400/60'
              }`}
            >
              Calculator
            </button>

            <button
              onClick={onClose}
              className="p-1.5 ml-2 rounded-lg text-teal-400/60 hover:text-teal-200 hover:bg-teal-500/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#061014]">
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl bg-[#09171f] border border-teal-500/20 hover:border-teal-400/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0d222b] border border-teal-500/30 flex items-center justify-center text-teal-300">
                      {app.name === 'Notepad' && <FileText className="w-5 h-5 text-amber-400" />}
                      {app.name === 'PowerShell' && <Terminal className="w-5 h-5 text-cyan-400" />}
                      {app.name === 'Calculator' && <Calculator className="w-5 h-5 text-emerald-400" />}
                      {app.name === 'Browser' && <Globe className="w-5 h-5 text-blue-400" />}
                      {app.name === 'VS Code' && <Code className="w-5 h-5 text-indigo-400" />}
                      {app.name === 'Spotify' && <Music className="w-5 h-5 text-green-400" />}
                    </div>
                    {app.isRunning && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>RUNNING</span>
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="font-hud font-bold text-sm text-teal-100 block">{app.name}</span>
                    <span className="text-[11px] text-teal-400/60 leading-tight block mt-0.5">{app.description}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playHudBeep('success');
                        onLaunchApp(app);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{app.isRunning ? 'Switch To' : 'Launch'}</span>
                    </button>
                    {app.isRunning && (
                      <button
                        onClick={() => {
                          playHudBeep('click');
                          onKillApp(app.id);
                        }}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs cursor-pointer"
                        title="End Task"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'running' && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-teal-400/70 uppercase block mb-3">Active System Tasks</span>
              {apps.filter(a => a.isRunning).map(app => (
                <div
                  key={app.id}
                  className="p-3 rounded-lg bg-[#09171f] border border-teal-500/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <span className="font-semibold text-teal-100">{app.name}</span>
                      <span className="font-mono text-teal-400/50 text-[10px] ml-2">PID: {Math.floor(1000 + Math.random() * 9000)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onKillApp(app.id)}
                    className="px-2.5 py-1 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 cursor-pointer"
                  >
                    Kill Process
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="h-full flex flex-col rounded-xl bg-[#04090c] border border-teal-500/25 p-4 font-mono-code text-xs">
              <div className="flex-1 overflow-y-auto space-y-1 mb-3 text-teal-300/80">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{log}</div>
                ))}
              </div>
              <form onSubmit={handleRunTerminal} className="flex items-center gap-2 pt-2 border-t border-teal-500/20">
                <span className="text-teal-400">PS&gt;</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="type PowerShell or Denver command..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono-code text-xs"
                />
              </form>
            </div>
          )}

          {activeTab === 'calc' && (
            <div className="max-w-xs mx-auto p-4 rounded-2xl bg-[#09171f] border border-teal-500/30">
              <div className="bg-[#040a0d] border border-teal-500/20 rounded-xl p-4 text-right mb-4">
                <span className="font-mono-code text-2xl text-teal-300 font-bold">{calcDisplay}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {['C', '/', '*', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0'].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleCalcBtn(btn)}
                    className={`py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      btn === '='
                        ? 'bg-teal-400 text-black shadow-[0_0_10px_#2dd4bf]'
                        : btn === 'C'
                        ? 'bg-rose-900/40 text-rose-300 border border-rose-500/30'
                        : ['/', '*', '-', '+'].includes(btn)
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                        : 'bg-[#0d212a] text-slate-200 hover:bg-[#122e3b]'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
