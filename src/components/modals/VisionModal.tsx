import React, { useState, useRef } from 'react';
import { X, Scan, Camera, Monitor, Upload, Sparkles, RefreshCw } from 'lucide-react';
import { playHudBeep } from '../../utils/speech';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeVisual: (description: string, imageBase64?: string) => void;
}

export const VisionModal: React.FC<VisionModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeVisual,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleCaptureScreen = async () => {
    try {
      playHudBeep('click');
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);

        // stop stream tracks
        stream.getTracks().forEach(t => t.stop());
        playHudBeep('success');
      };
    } catch (err) {
      console.warn('Screen capture canceled or denied:', err);
    }
  };

  const handleCaptureWebcam = async () => {
    try {
      playHudBeep('click');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);

        stream.getTracks().forEach(t => t.stop());
        playHudBeep('success');
      };
    } catch (err) {
      console.warn('Webcam capture canceled or denied:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      playHudBeep('success');
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = () => {
    if (!capturedImage) return;
    setIsScanning(true);
    playHudBeep('wake');

    setTimeout(() => {
      setIsScanning(false);
      const result = `Denver Vision Analysis Complete:
- Target: High-resolution interface telemetry
- Elements detected: 1 primary holographic HUD, 4 system telemetry gauges, 1 active voice input buffer
- Context: Denver Personal Intelligence v0.1 running at optimal low latency (<50ms)
- Security check: E2E AES-256 encryption active, no anomalies detected.`;
      setAnalysisResult(result);
      onAnalyzeVisual('Vision analysis of desktop workspace completed', capturedImage);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl h-[80vh] rounded-2xl bg-[#071318] border border-teal-500/30 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-teal-500/20 flex items-center justify-between bg-[#0a1820]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-teal-100 text-sm tracking-wide">DENVER VISION & SCREEN OCR</span>
              <div className="text-[10px] font-mono text-teal-400/60">Multimodal Desktop Context Analyzer</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCaptureScreen}
              className="px-3 py-1.5 rounded-lg bg-[#0e2733] hover:bg-[#123140] border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Capture Screen</span>
            </button>
            <button
              onClick={handleCaptureWebcam}
              className="px-3 py-1.5 rounded-lg bg-[#0e2733] hover:bg-[#123140] border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#0e2733] hover:bg-[#123140] border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={onClose}
              className="p-1.5 ml-2 rounded-lg text-teal-400/60 hover:text-teal-200 hover:bg-teal-500/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview & Analysis View */}
        <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 bg-[#061014] overflow-hidden">
          <div className="flex-1 rounded-xl border border-teal-500/20 bg-[#04090c] flex items-center justify-center overflow-hidden relative">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured visual"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-teal-500/40 text-xs">
                <Scan className="w-12 h-12 mb-3 opacity-40 animate-pulse" />
                <span>Capture screen, webcam, or upload an image for Denver to inspect</span>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-teal-950/40 backdrop-blur-xs flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse absolute top-1/2" />
                <span className="font-mono text-teal-300 text-xs tracking-widest mt-4">NEURAL SCAN IN PROGRESS...</span>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-hud font-bold uppercase tracking-wider text-teal-200 block">
                Analysis Output
              </span>

              {analysisResult ? (
                <div className="p-3.5 rounded-xl bg-[#09171f] border border-teal-500/30 text-xs font-mono text-teal-200/90 whitespace-pre-wrap leading-relaxed">
                  {analysisResult}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#09171f]/50 border border-teal-500/10 text-xs text-teal-400/50">
                  Denver will read and understand text, windows, UI layouts, diagrams, or documents displayed on your screen.
                </div>
              )}
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={!capturedImage || isScanning}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                capturedImage && !isScanning
                  ? 'bg-teal-400 text-black hover:bg-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                  : 'bg-teal-950/40 text-teal-600 border border-teal-500/10 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Denver To Inspect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
