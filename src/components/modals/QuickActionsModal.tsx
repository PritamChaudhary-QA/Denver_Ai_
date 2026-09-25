import React from 'react';
import { X, Folder, Scan, Clock, Terminal, HardDrive, ShieldCheck, Sparkles } from 'lucide-react';
import { playHudBeep } from '../../utils/speech';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFiles: () => void;
  onOpenVision: () => void;
  onOpenTasks: () => void;
  onOpenAllApps: () => void;
  onOpenSettings: () => void;
  onCommandTrigger: (cmd: string) => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onOpenFiles,
  onOpenVision,
  onOpenTasks,
  onOpenAllApps,
  onOpenSettings,
  onCommandTrigger,
}) => {
  if (!isOpen) return null;

  const quickPrompts = [
    { label: 'Check CPU & Memory Status', cmd: 'Check CPU and Memory status' },
    { label: 'List Workspace Files', cmd: 'List all workspace files' },
    { label: 'Create New Project Notes', cmd: 'Create a new file named project_notes.md' },
    { label: 'Schedule 15 Min Break', cmd: 'Schedule break in 15 minutes' },
    { label: 'Launch Windows Terminal', cmd: 'Launch Windows PowerShell console' },
    { label: 'Inspect Encrypted Vault', cmd: 'Check E2E Vault status' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#071318] border border-teal-500/30 overflow-hidden shadow-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/20 mb-4">
          <div className="flex items-center gap-2 text-teal-200 font-hud font-bold text-sm tracking-wide">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>DENVER QUICK ACTIONS & TOOLS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-400/60 hover:text-teal-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button
            onClick={() => {
              playHudBeep('click');
              onClose();
              onOpenFiles();
            }}
            className="p-3 rounded-xl bg-[#091820] hover:bg-[#0e2430] border border-teal-500/20 text-left flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Folder className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-semibold text-teal-100 block">Files & Storage</span>
              <span className="text-[10px] text-teal-400/50">Browse local files</span>
            </div>
          </button>

          <button
            onClick={() => {
              playHudBeep('click');
              onClose();
              onOpenVision();
            }}
            className="p-3 rounded-xl bg-[#091820] hover:bg-[#0e2430] border border-teal-500/20 text-left flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Scan className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-xs font-semibold text-teal-100 block">Vision & OCR</span>
              <span className="text-[10px] text-teal-400/50">Capture screen context</span>
            </div>
          </button>

          <button
            onClick={() => {
              playHudBeep('click');
              onClose();
              onOpenTasks();
            }}
            className="p-3 rounded-xl bg-[#091820] hover:bg-[#0e2430] border border-teal-500/20 text-left flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs font-semibold text-teal-100 block">Scheduler</span>
              <span className="text-[10px] text-teal-400/50">Real-time alerts</span>
            </div>
          </button>

          <button
            onClick={() => {
              playHudBeep('click');
              onClose();
              onOpenAllApps();
            }}
            className="p-3 rounded-xl bg-[#091820] hover:bg-[#0e2430] border border-teal-500/20 text-left flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Terminal className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-xs font-semibold text-teal-100 block">Windows OS Apps</span>
              <span className="text-[10px] text-teal-400/50">Automation suite</span>
            </div>
          </button>
        </div>

        {/* Quick Voice / Text prompts */}
        <span className="text-[11px] font-mono text-teal-400/60 uppercase block mb-2">Instant Denver Commands</span>
        <div className="space-y-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                playHudBeep('click');
                onClose();
                onCommandTrigger(p.cmd);
              }}
              className="w-full text-left p-2 rounded-lg bg-[#061014] hover:bg-[#0b1f28] border border-teal-500/10 text-xs text-teal-200/90 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{p.label}</span>
              <span className="text-[10px] font-mono text-teal-400/50">&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
