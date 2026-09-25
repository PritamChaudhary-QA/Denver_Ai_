import React, { useState } from 'react';
import { X, Bell, Clock, Plus, Check, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScheduledTask } from '../../types/denver';
import { playHudBeep } from '../../utils/speech';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ScheduledTask[];
  onAddTask: (task: ScheduledTask) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [minutesDelay, setMinutesDelay] = useState('10');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const mins = Math.max(1, parseInt(minutesDelay) || 5);
    const dueTime = Date.now() + mins * 60 * 1000;
    const dueString = new Date(dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const task: ScheduledTask = {
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      dueTime,
      dueString,
      completed: false,
      voiceNotified: false,
    };

    onAddTask(task);
    setNewTitle('');
    setIsCreating(false);
    playHudBeep('success');
  };

  const getRemainingTime = (dueTime: number): string => {
    const diff = Math.max(0, Math.floor((dueTime - Date.now()) / 1000));
    if (diff === 0) return 'Triggered / Due now';
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s remaining`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-[#071318] border-l border-teal-500/30 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-16 px-5 border-b border-teal-500/20 flex items-center justify-between bg-[#0a1820]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-teal-100 text-sm tracking-wide">TASK SCHEDULER & ALERTS</span>
              <div className="text-[10px] font-mono text-teal-400/60">Real-Time Contextual Notifications</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-400/60 hover:text-teal-200 hover:bg-teal-500/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-4 border-b border-teal-500/15 bg-[#061014]">
          {isCreating ? (
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title (e.g. Backup database, Meeting with team)"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0a171d] border border-teal-500/30 text-xs text-teal-100 outline-none"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-teal-400/70 font-mono">Remind in:</span>
                <select
                  value={minutesDelay}
                  onChange={(e) => setMinutesDelay(e.target.value)}
                  className="px-2 py-1 rounded bg-[#0a171d] border border-teal-500/30 text-xs text-teal-200 outline-none"
                >
                  <option value="1">1 minute (Test alert)</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
                <button
                  type="submit"
                  className="ml-auto px-3 py-1 rounded bg-teal-400 text-black text-xs font-semibold cursor-pointer"
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2 py-1 rounded bg-teal-950 text-teal-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2 px-3 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Task</span>
            </button>
          )}
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-teal-500/40 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <span>No active scheduled tasks in Denver queue</span>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-[#061014]/60 border-teal-500/10 opacity-60'
                    : Date.now() >= task.dueTime
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : 'bg-[#09171f] border-teal-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-semibold ${task.completed ? 'line-through text-teal-500/60' : 'text-teal-100'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1">
                    {!task.completed && (
                      <button
                        onClick={() => {
                          playHudBeep('success');
                          onCompleteTask(task.id);
                        }}
                        className="p-1 rounded hover:bg-teal-500/20 text-teal-400/70 hover:text-teal-200 cursor-pointer"
                        title="Mark Complete"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        playHudBeep('click');
                        onDeleteTask(task.id);
                      }}
                      className="p-1 rounded hover:bg-rose-950/40 text-teal-400/50 hover:text-rose-400 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-teal-400/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-400" />
                    <span>Target: {task.dueString}</span>
                  </span>
                  <span className={Date.now() >= task.dueTime && !task.completed ? 'text-rose-400 font-bold' : ''}>
                    {task.completed ? 'Completed' : getRemainingTime(task.dueTime)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
