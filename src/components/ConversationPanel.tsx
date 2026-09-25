import React, { useState } from 'react';
import { MessageSquare, History, Search, Plus, RotateCcw, Volume2, ShieldCheck, ExternalLink, Terminal, Folder, CheckCircle2, Play } from 'lucide-react';
import { ChatMessage, ActionCard } from '../types/denver';
import { speakDenver, playHudBeep } from '../utils/speech';

interface ConversationPanelProps {
  messages: ChatMessage[];
  onNewConversation: () => void;
  onSelectActionPrompt: (prompt: string) => void;
  onOpenTools: () => void;
  onOpenVision: () => void;
  onOpenSettings: () => void;
  onOpenFileWorkspace: () => void;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  onNewConversation,
  onSelectActionPrompt,
  onOpenTools,
  onOpenVision,
  onOpenSettings,
  onOpenFileWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'conversation' | 'history' | 'search'>('conversation');
  const [searchQuery, setSearchQuery] = useState('');

  const renderActionCard = (action: ActionCard) => {
    return (
      <div className="mt-2.5 p-2.5 rounded-lg bg-[#07161d] border border-teal-500/25 text-xs font-mono">
        <div className="flex items-center justify-between text-teal-300 mb-1">
          <span className="flex items-center gap-1.5 font-semibold">
            <Terminal className="w-3.5 h-3.5 text-teal-400" />
            <span>ACTION: {action.type.toUpperCase()}</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>EXECUTED</span>
          </span>
        </div>
        <div className="text-teal-200/90 text-[11px] mb-1">Target: <span className="text-white">{action.target}</span></div>
        <div className="text-teal-400/70 text-[10px]">{action.details}</div>
      </div>
    );
  };

  return (
    <aside className="w-80 xl:w-96 h-full border-l border-teal-500/15 bg-[#061014]/95 flex flex-col select-none shrink-0 z-20">
      {/* Header Tabs */}
      <div className="flex items-center gap-6 px-4 pt-3.5 pb-2 border-b border-teal-500/15 text-sm">
        <button
          onClick={() => {
            playHudBeep('click');
            setActiveTab('conversation');
          }}
          className={`flex items-center gap-1.5 pb-1 relative transition-colors cursor-pointer ${
            activeTab === 'conversation' ? 'text-teal-300 font-semibold' : 'text-teal-400/50 hover:text-teal-300/80'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Conversation</span>
          {activeTab === 'conversation' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]" />
          )}
        </button>

        <button
          onClick={() => {
            playHudBeep('click');
            setActiveTab('history');
          }}
          className={`flex items-center gap-1.5 pb-1 relative transition-colors cursor-pointer ${
            activeTab === 'history' ? 'text-teal-300 font-semibold' : 'text-teal-400/50 hover:text-teal-300/80'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]" />
          )}
        </button>

        <button
          onClick={() => {
            playHudBeep('click');
            setActiveTab('search');
          }}
          className={`flex items-center gap-1.5 pb-1 relative transition-colors cursor-pointer ${
            activeTab === 'search' ? 'text-teal-300 font-semibold' : 'text-teal-400/50 hover:text-teal-300/80'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          {activeTab === 'search' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]" />
          )}
        </button>
      </div>

      {activeTab === 'conversation' && (
        <>
          {/* Subheader: New conversation & actions */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-teal-500/10">
            <span className="text-sm font-medium text-teal-100">New conversation</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playHudBeep('click');
                  onNewConversation();
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-400/10 hover:bg-teal-400/20 border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
              <button
                onClick={() => {
                  playHudBeep('click');
                  onNewConversation();
                }}
                title="Reset conversation"
                className="p-1 rounded-lg hover:bg-teal-500/10 text-teal-400/60 hover:text-teal-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Timestamp divider */}
            <div className="text-center font-mono-code text-[10px] tracking-widest text-teal-500/50 uppercase">
              TODAY
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.sender === 'denver' ? (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0a1e27] border border-teal-400/40 flex items-center justify-center text-teal-300 font-hud font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(45,212,191,0.2)]">
                      D
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-hud font-bold text-xs tracking-wider text-teal-200">DENVER</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code text-[10px] text-teal-500/60">{msg.timestamp}</span>
                          <button
                            onClick={() => speakDenver(msg.text)}
                            title="Play audio voice"
                            className="text-teal-400/50 hover:text-teal-300 cursor-pointer p-0.5"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-200 leading-relaxed font-sans">
                        {msg.text}
                      </div>

                      {/* Initial Denver Welcome Card */}
                      {msg.isInitialWelcome && (
                        <div className="mt-3 space-y-3">
                          {/* Workspace ready card */}
                          <div className="p-3 rounded-xl bg-[#091b23]/80 border border-teal-500/30">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300 mb-1">
                              <span className="text-teal-400">✦</span>
                              <span>YOUR WORKSPACE IS READY</span>
                            </div>
                            <p className="text-[11px] text-teal-200/80 leading-relaxed font-sans">
                              Use voice, vision, files, live system tools, browser automation, and Denver's local desktop agent.
                            </p>
                          </div>

                          {/* Quick shortcuts */}
                          <div>
                            <span className="text-[10px] font-mono tracking-wider text-teal-400/60 uppercase block mb-1.5">
                              MAKE YOURSELF AT HOME
                            </span>
                            <div className="space-y-1.5">
                              <button
                                onClick={onOpenSettings}
                                className="w-full text-left p-2 rounded-lg bg-[#07171e] hover:bg-[#0c242f] border border-teal-500/15 text-xs text-teal-200 flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span>Personalize my workspace</span>
                                <ExternalLink className="w-3 h-3 text-teal-400/70" />
                              </button>
                              <button
                                onClick={onOpenTools}
                                className="w-full text-left p-2 rounded-lg bg-[#07171e] hover:bg-[#0c242f] border border-teal-500/15 text-xs text-teal-200 flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span>Open workspace tools</span>
                                <ExternalLink className="w-3 h-3 text-teal-400/70" />
                              </button>
                              <button
                                onClick={onOpenVision}
                                className="w-full text-left p-2 rounded-lg bg-[#07171e] hover:bg-[#0c242f] border border-teal-500/15 text-xs text-teal-200 flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span>Open the vision workspace</span>
                                <ExternalLink className="w-3 h-3 text-teal-400/70" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Action execution block if present */}
                      {msg.actionCard && renderActionCard(msg.actionCard)}
                    </div>
                  </div>
                ) : (
                  /* User message */
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0d2833] border border-teal-500/30 px-3.5 py-2 text-xs text-slate-100 shadow-sm">
                      <div className="flex items-center justify-between gap-4 mb-0.5">
                        <span className="font-hud font-bold text-[11px] text-teal-300">YOU (PRITAM)</span>
                        <span className="font-mono-code text-[9px] text-teal-400/50">{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer info & encryption badge */}
          <div className="p-3 border-t border-teal-500/15 bg-[#050c0f]">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-teal-400/60 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>This session stays in your browser</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-teal-500/40 uppercase px-2">
              <span>SESSION 001</span>
              <span>{messages.length} {messages.length === 1 ? 'MESSAGE' : 'MESSAGES'}</span>
            </div>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <span className="text-xs font-mono text-teal-400/70 uppercase block mb-2">Archived Sessions</span>
          <div className="p-3 rounded-lg bg-[#09171e] border border-teal-500/20 hover:border-teal-400/40 cursor-pointer">
            <div className="text-xs font-medium text-teal-100 mb-1">Session #001 (Current)</div>
            <div className="text-[10px] font-mono text-teal-400/60">Active workspace &bull; Pritam</div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="p-4 flex-1 flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversation..."
              className="w-full bg-[#08171e] border border-teal-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-teal-500/40 outline-none"
            />
          </div>
          <div className="text-[11px] text-teal-400/50 text-center mt-6">
            Type keywords to search memory index
          </div>
        </div>
      )}
    </aside>
  );
};
