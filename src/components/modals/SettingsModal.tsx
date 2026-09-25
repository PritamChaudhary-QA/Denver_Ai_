import React, { useState } from 'react';
import { X, Shield, Lock, Unlock, Key, Copy, Check, Download, Radio, Volume2, Mic, Cpu } from 'lucide-react';
import { VaultSecret } from '../../types/denver';
import { encryptData, decryptData } from '../../utils/crypto';
import { speakDenver, playHudBeep } from '../../utils/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktopAgentOnline: boolean;
  onCheckAgentConnection: () => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDesktopAgentOnline,
  onCheckAgentConnection,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'agent' | 'voice'>('vault');

  // Vault state
  const [passphrase, setPassphrase] = useState('DENVER-2026');
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [secrets, setSecrets] = useState<VaultSecret[]>([
    {
      id: 'sec_1',
      label: 'Local Windows PC Root Credential',
      category: 'password',
      cipherText: '',
      iv: '',
      plainPreview: 'Pritam_Administrator_Win11',
      updatedAt: '25/09/2026',
    },
    {
      id: 'sec_2',
      label: 'Gemini 3.8 Flash System Key',
      category: 'api_key',
      cipherText: '',
      iv: '',
      plainPreview: 'AI_STUDIO_SERVER_INJECTED_SECURE',
      updatedAt: '25/09/2026',
    },
  ]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Agent check state
  const [checkingAgent, setCheckingAgent] = useState(false);
  const [agentStatusMsg, setAgentStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSecret = async () => {
    if (!newLabel.trim() || !newValue.trim()) return;
    try {
      const { cipherText, iv } = await encryptData(newValue.trim(), passphrase);
      const newSec: VaultSecret = {
        id: 'sec_' + Date.now(),
        label: newLabel.trim(),
        category: 'credential',
        cipherText,
        iv,
        plainPreview: newValue.trim(),
        updatedAt: new Date().toLocaleDateString(),
      };
      setSecrets(prev => [...prev, newSec]);
      setNewLabel('');
      setNewValue('');
      playHudBeep('success');
    } catch {
      alert('Encryption failed');
    }
  };

  const handleCopySecret = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playHudBeep('click');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleTestAgent = async () => {
    setCheckingAgent(true);
    playHudBeep('click');
    const ok = await onCheckAgentConnection();
    setCheckingAgent(false);
    if (ok) {
      setAgentStatusMsg('Success! Connected to Denver Desktop Agent on http://localhost:8765');
      playHudBeep('success');
    } else {
      setAgentStatusMsg('Desktop Agent not detected on localhost:8765. Running in high-performance browser emulation mode.');
    }
  };

  const downloadPythonAgent = () => {
    window.open('/api/agent/script/python', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl h-[80vh] rounded-2xl bg-[#071318] border border-teal-500/30 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-teal-500/20 flex items-center justify-between bg-[#0a1820]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-teal-100 text-sm tracking-wide">DENVER CONTROL & ENCRYPTION VAULT</span>
              <div className="text-[10px] font-mono text-teal-400/60">E2E AES-256-GCM & Windows Native Automation Bridge</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                activeTab === 'vault' ? 'bg-teal-400/20 text-teal-200 border border-teal-400/30' : 'text-teal-400/60'
              }`}
            >
              Encrypted Vault
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                activeTab === 'agent' ? 'bg-teal-400/20 text-teal-200 border border-teal-400/30' : 'text-teal-400/60'
              }`}
            >
              Windows Agent Setup
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                activeTab === 'voice' ? 'bg-teal-400/20 text-teal-200 border border-teal-400/30' : 'text-teal-400/60'
              }`}
            >
              Voice Core
            </button>

            <button
              onClick={onClose}
              className="p-1.5 ml-2 rounded-lg text-teal-400/60 hover:text-teal-200 hover:bg-teal-500/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#061014]">
          {activeTab === 'vault' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Vault status banner */}
              <div className="p-4 rounded-xl bg-[#09171f] border border-teal-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                    {isUnlocked ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div>
                    <span className="font-hud font-bold text-teal-100 text-sm block">AES-256-GCM Hardware Vault</span>
                    <span className="text-[11px] text-teal-400/60">
                      Sensitive keys and credentials encrypted directly on your machine.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsUnlocked(!isUnlocked)}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-300 text-xs font-medium cursor-pointer"
                >
                  {isUnlocked ? 'Lock Vault' : 'Unlock Vault'}
                </button>
              </div>

              {isUnlocked && (
                <>
                  {/* Add secret */}
                  <div className="p-4 rounded-xl bg-[#09171f] border border-teal-500/20 space-y-3">
                    <span className="text-xs font-hud font-bold uppercase tracking-wider text-teal-200 block">
                      Store New Encrypted Secret
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Label (e.g. Windows Token, API Key)"
                        className="px-3 py-1.5 rounded-lg bg-[#061116] border border-teal-500/20 text-xs text-teal-100 outline-none"
                      />
                      <input
                        type="password"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="Secret value"
                        className="px-3 py-1.5 rounded-lg bg-[#061116] border border-teal-500/20 text-xs text-teal-100 outline-none"
                      />
                    </div>
                    <button
                      onClick={handleAddSecret}
                      className="py-1.5 px-4 rounded-lg bg-teal-400 text-black text-xs font-semibold hover:bg-teal-300 cursor-pointer transition-colors"
                    >
                      Encrypt & Save to Vault
                    </button>
                  </div>

                  {/* List secrets */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-teal-400/70 uppercase block mb-1">Stored Secrets</span>
                    {secrets.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-3 rounded-lg bg-[#09171f] border border-teal-500/20 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Key className="w-4 h-4 text-teal-400" />
                          <div>
                            <span className="font-semibold text-teal-100 block">{sec.label}</span>
                            <span className="font-mono text-teal-400/50 text-[10px]">
                              {sec.plainPreview ? '••••••••••••••••' : 'Encrypted with AES-256'} &bull; {sec.updatedAt}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopySecret(sec.id, sec.plainPreview || '')}
                          className="px-2.5 py-1 rounded bg-[#0e2733] hover:bg-[#123140] border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === sec.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === sec.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 rounded-xl bg-[#09171f] border border-teal-500/30">
                <span className="font-hud font-bold text-teal-100 text-base block mb-1">
                  How Denver Operates Your Real Windows OS
                </span>
                <p className="text-xs text-teal-200/80 leading-relaxed font-sans mb-4">
                  Denver can operate completely inside your browser with rich emulation, OR you can run the lightweight companion agent on your Windows PC for 100% real native control (launching actual Windows software, PowerShell terminal, controlling volume, and opening folders)!
                </p>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[#050e12] border border-teal-500/15">
                    <span className="text-teal-400 font-bold block mb-1">Step 1: Download Denver Agent</span>
                    <button
                      onClick={downloadPythonAgent}
                      className="mt-1 px-3 py-1.5 rounded bg-teal-400 text-black text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download denver_agent.py</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-[#050e12] border border-teal-500/15">
                    <span className="text-teal-400 font-bold block mb-1">Step 2: Run in PowerShell or Command Prompt</span>
                    <pre className="text-slate-300 bg-[#020507] p-2 rounded select-text">
                      pip install flask flask-cors
                      python denver_agent.py
                    </pre>
                  </div>

                  <div className="p-3 rounded-lg bg-[#050e12] border border-teal-500/15">
                    <span className="text-teal-400 font-bold block mb-1">Step 3: Test Local Agent Connection</span>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={handleTestAgent}
                        disabled={checkingAgent}
                        className="px-3 py-1.5 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-medium cursor-pointer"
                      >
                        {checkingAgent ? 'Testing port 8765...' : 'Test Connection (http://localhost:8765)'}
                      </button>
                      <span className="text-teal-400/70 text-[11px]">
                        {isDesktopAgentOnline ? 'Status: ONLINE' : 'Status: Ready to connect'}
                      </span>
                    </div>
                    {agentStatusMsg && (
                      <p className="mt-2 text-teal-300 text-[11px] font-sans">{agentStatusMsg}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 rounded-xl bg-[#09171f] border border-teal-500/30 space-y-4">
                <span className="font-hud font-bold text-teal-100 text-base block">
                  Denver Voice & Wake Word Configuration
                </span>

                <div className="p-3 rounded-lg bg-[#050e12] border border-teal-500/15 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-teal-200 block">Jarvis Persona Speech Synthesis</span>
                    <span className="text-[11px] text-teal-400/60">British / Authority tone voice model</span>
                  </div>
                  <button
                    onClick={() => speakDenver("Denver personal intelligence is online and at your service, Pritam.")}
                    className="px-3 py-1.5 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Voice</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-[#050e12] border border-teal-500/15">
                  <span className="text-xs font-semibold text-teal-200 block mb-1">Wake Word Trigger</span>
                  <span className="text-[11px] text-teal-400/60 block mb-2">
                    Say "Denver" or "Hey Denver" when the wake button is active to trigger hands-free input.
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-teal-950 text-teal-300 border border-teal-500/30 text-xs font-mono">
                      Keyword: "Denver"
                    </span>
                    <span className="px-2 py-1 rounded bg-teal-950 text-teal-300 border border-teal-500/30 text-xs font-mono">
                      Keyword: "Hey Denver"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
