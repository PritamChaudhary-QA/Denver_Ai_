import React, { useState, useEffect, useRef } from 'react';
import { Mic, ArrowUp, Plus, CornerDownLeft, Volume2 } from 'lucide-react';
import { playHudBeep } from '../utils/speech';

interface IntelligenceCoreHUDProps {
  onSendMessage: (text: string) => void;
  isListening: boolean;
  onToggleMic: () => void;
  isSpeaking: boolean;
  statusText?: string;
  onOpenQuickActions: () => void;
}

export const IntelligenceCoreHUD: React.FC<IntelligenceCoreHUDProps> = ({
  onSendMessage,
  isListening,
  onToggleMic,
  isSpeaking,
  statusText = 'Workspace ready',
  onOpenQuickActions,
}) => {
  const [inputText, setInputText] = useState('');
  const [coreState, setCoreState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isListening) {
      setCoreState('listening');
    } else if (isSpeaking) {
      setCoreState('speaking');
    } else {
      setCoreState('idle');
    }
  }, [isListening, isSpeaking]);

  // Audio Waveform Visualizer simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Determine wave amplitude based on listening/speaking state
      let amp = 6;
      if (coreState === 'listening') amp = 18;
      if (coreState === 'speaking') amp = 24;

      // Draw primary wave
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = coreState === 'listening' ? 'rgba(52, 211, 153, 0.8)' : 'rgba(45, 212, 191, 0.7)';

      for (let x = 0; x < width; x++) {
        // Bell curve envelope to taper edges smoothly
        const envelope = Math.sin((x / width) * Math.PI);
        const y = height / 2 + Math.sin(x * 0.035 + phase) * amp * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw secondary softer wave
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      for (let x = 0; x < width; x++) {
        const envelope = Math.sin((x / width) * Math.PI);
        const y = height / 2 + Math.sin(x * 0.05 - phase * 0.8) * (amp * 0.7) * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += coreState === 'idle' ? 0.03 : 0.09;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [coreState]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    playHudBeep('click');
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-between py-6 px-4 relative overflow-hidden select-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#091a22]/70 via-[#050d12]/95 to-[#04080a]">
      {/* Top HUD Core identifier */}
      <div className="w-full flex items-center justify-center font-mono-code text-[11px] tracking-[0.25em] text-teal-400/60 uppercase">
        <span className="text-teal-500/40 mr-2">[</span>
        <span className="text-teal-300/80">INTELLIGENCE CORE</span>
        <span className="text-teal-500/40 ml-2">]</span>
        <span className="ml-3 text-teal-400/50">V 0.1</span>
      </div>

      {/* Center Holographic Circle HUD */}
      <div className="relative my-auto flex flex-col items-center justify-center w-[360px] h-[360px] md:w-[420px] md:h-[420px]">
        {/* Outermost rotating orbit dashed ring */}
        <div className="absolute inset-0 rounded-full border border-teal-500/20 border-dashed animate-spin-slow pointer-events-none" />

        {/* Outer counter-rotating ring with orbital satellite marker */}
        <div className="absolute inset-4 rounded-full border border-teal-500/15 animate-spin-reverse-slow pointer-events-none">
          {/* Orbital cyan particle */}
          <div className="absolute top-4 left-1/4 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
          <div className="absolute bottom-10 right-1/4 w-1.5 h-1.5 rounded-full bg-teal-400/80 shadow-[0_0_8px_#2dd4bf]" />
        </div>

        {/* Secondary inner geometric guide circle */}
        <div className="absolute inset-12 rounded-full border border-teal-500/10 pointer-events-none" />

        {/* Radial Status Badges */}
        <div className="absolute top-2 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-teal-300/70">
          <span className="text-teal-400">+</span>
          <span>MULTIMODAL CORE</span>
        </div>

        <div className="absolute top-6 right-8 text-[9px] font-mono tracking-widest text-teal-400/50">
          {coreState === 'listening' ? 'LISTENING' : coreState === 'speaking' ? 'OUTPUT ACTIVE' : 'CORE IDLE'}
        </div>

        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest text-teal-400/50 uppercase">
          VOICE
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest text-teal-400/50 uppercase">
          VISION
        </div>

        <div className="absolute bottom-4 text-[10px] font-mono tracking-widest text-teal-400/50">
          D / 01
        </div>

        {/* Center Glowing Disc / Trigger button */}
        <button
          onClick={() => {
            playHudBeep(isListening ? 'click' : 'wake');
            onToggleMic();
          }}
          title="Click to speak with Denver"
          className={`relative z-10 w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center transition-all duration-500 cursor-pointer ${
            coreState === 'listening'
              ? 'bg-[#08222a] border-2 border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.45)] scale-105'
              : coreState === 'speaking'
              ? 'bg-[#09262f] border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.45)]'
              : 'bg-[#07161c]/90 hover:bg-[#0a2028] border-2 border-teal-400/40 hover:border-teal-300/70 shadow-[0_0_35px_rgba(45,212,191,0.25)]'
          }`}
        >
          {/* Subtle concentric rings inside disc */}
          <div className="absolute inset-3 rounded-full border border-teal-500/20 pointer-events-none" />
          <div className="absolute inset-7 rounded-full border border-teal-500/10 pointer-events-none" />

          {/* Center Voice Icon / Dynamic Soundwave */}
          <div className="flex items-center gap-1 mb-2.5">
            <span className={`w-1 rounded-full bg-teal-300 transition-all ${coreState === 'listening' ? 'h-5 animate-pulse' : 'h-3'}`} />
            <span className={`w-1 rounded-full bg-teal-300 transition-all ${coreState === 'listening' ? 'h-7 animate-pulse' : 'h-5'}`} />
            <span className={`w-1 rounded-full bg-cyan-300 transition-all ${coreState === 'listening' ? 'h-9 animate-pulse' : 'h-7'}`} />
            <span className={`w-1 rounded-full bg-teal-300 transition-all ${coreState === 'listening' ? 'h-7 animate-pulse' : 'h-5'}`} />
            <span className={`w-1 rounded-full bg-teal-300 transition-all ${coreState === 'listening' ? 'h-5 animate-pulse' : 'h-3'}`} />
          </div>

          {/* DENVER Title */}
          <span className="font-hud font-bold text-2xl md:text-3xl tracking-[0.25em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            DENVER
          </span>

          {/* Subtitle / Voice Status */}
          <span className="font-mono-code text-[10px] md:text-[11px] tracking-[0.22em] text-teal-300/80 uppercase mt-1">
            {coreState === 'listening'
              ? 'LISTENING TO YOU...'
              : coreState === 'speaking'
              ? 'SPEAKING RESPONSE...'
              : 'AWAITING YOUR VOICE'}
          </span>
        </button>

        {/* Audio Waveform Canvas directly beneath circular core */}
        <div className="absolute -bottom-8 w-64 md:w-80 h-10 flex items-center justify-center">
          <canvas ref={canvasRef} width={320} height={40} className="w-full h-full" />
        </div>
      </div>

      {/* Real-time State & Command Bar Section */}
      <div className="w-full max-w-xl flex flex-col items-center gap-2 mt-auto">
        {/* Glow status text */}
        <div className="text-teal-300 font-medium text-xs md:text-sm tracking-wide text-center drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
          {statusText}
        </div>

        {/* Command Input Box */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#08171e]/90 border border-teal-500/25 focus-within:border-teal-400 focus-within:shadow-[0_0_20px_rgba(45,212,191,0.25)] transition-all shadow-lg"
        >
          {/* Plus button for quick actions */}
          <button
            type="button"
            onClick={() => {
              playHudBeep('click');
              onOpenQuickActions();
            }}
            title="Attach file / Vision scan / Quick task"
            className="w-8 h-8 rounded-lg bg-[#0d222b] hover:bg-[#122e3a] border border-teal-500/20 text-teal-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Denver anything..."
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-teal-400/40 text-sm px-2"
          />

          {/* Enter key indicator */}
          <div className="hidden sm:flex items-center text-teal-500/40 text-xs mr-1">
            <CornerDownLeft className="w-3.5 h-3.5" />
          </div>

          {/* Mic Button */}
          <button
            type="button"
            onClick={() => {
              playHudBeep(isListening ? 'click' : 'wake');
              onToggleMic();
            }}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-[0_0_10px_#34d399]'
                : 'bg-[#0d222b] hover:bg-[#122e3a] border-teal-500/20 text-teal-300'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            title="Send command"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              inputText.trim()
                ? 'bg-teal-400 hover:bg-teal-300 text-[#050b0e] shadow-[0_0_12px_rgba(45,212,191,0.5)]'
                : 'bg-teal-950/40 text-teal-600 border border-teal-500/10 cursor-not-allowed'
            }`}
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Sub Hints */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-teal-400/50 px-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400/70" />
            <span>Text & voice workspace</span>
          </span>
          <span className="flex items-center gap-1 text-[10px]">
            <span>■ Stop</span>
            <kbd className="px-1 py-0.2 bg-[#0a1820] border border-teal-500/20 rounded text-[9px] text-teal-300/70">Esc</kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
