/**
 * Denver Voice & Audio Engine:
 * - Speech-to-Text via Web Speech Recognition
 * - Text-to-Speech via Web SpeechSynthesis with Jarvis persona
 * - Synthetic sci-fi audio sound effects via Web Audio API
 */

// Web Audio synthesizer for futuristic feedback sounds
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playHudBeep(type: 'click' | 'wake' | 'alert' | 'success' = 'click') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'wake') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.08);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.18);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.setValueAtTime(500, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // audio context may require user interaction
  }
}

// Text-to-Speech Engine
export function speakDenver(text: string, onStart?: () => void, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find a refined British or clear English voice if possible for Jarvis effect
  const voices = window.speechSynthesis.getVoices();
  const jarvisVoice = voices.find(v => 
    v.name.includes('UK') || 
    v.name.includes('English (United Kingdom)') || 
    v.name.includes('George') || 
    v.name.includes('Daniel') || 
    (v.lang.startsWith('en') && v.name.includes('Male'))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (jarvisVoice) {
    utterance.voice = jarvisVoice;
  }

  utterance.pitch = 0.95; // Slightly deeper, authoritative
  utterance.rate = 1.05; // Swift, prompt delivery
  utterance.volume = 1.0;

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

// Speech-to-Text Recognition Hook / Listener helper
export interface SpeechRecognitionHandlers {
  onResult: (transcript: string) => void;
  onListeningChange: (listening: boolean) => void;
  onError?: (error: any) => void;
}

export class DenverSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;
  private continuous: boolean = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start(handlers: SpeechRecognitionHandlers, continuous: boolean = false) {
    if (!this.recognition) return;

    this.continuous = continuous;

    this.recognition.onstart = () => {
      this.isListening = true;
      playHudBeep('wake');
      handlers.onListeningChange(true);
    };

    this.recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim();
      handlers.onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (handlers.onError) handlers.onError(event.error);
    };

    this.recognition.onend = () => {
      if (this.continuous && this.isListening) {
        try {
          this.recognition.start();
        } catch {
          this.isListening = false;
          handlers.onListeningChange(false);
        }
      } else {
        this.isListening = false;
        handlers.onListeningChange(false);
      }
    };

    try {
      this.recognition.start();
    } catch {
      // already started
    }
  }

  public stop(handlers?: Partial<SpeechRecognitionHandlers>) {
    this.continuous = false;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (handlers?.onListeningChange) {
      handlers.onListeningChange(false);
    }
  }

  public getListening(): boolean {
    return this.isListening;
  }
}
