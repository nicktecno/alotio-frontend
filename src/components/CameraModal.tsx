'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface CameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [captured, setCaptured] = useState<string | null>(null);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setReady(false);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch {
      if (facing === 'environment') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
            audio: false,
          });
          streamRef.current = stream;
          setFacingMode('user');
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => setReady(true);
          }
        } catch {
          setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
        }
      } else {
        setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSwitchCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    setCaptured(null);
    startCamera(next);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL('image/jpeg', 0.9));
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(file);
      },
      'image/jpeg',
      0.9,
    );
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        <button onClick={onClose} className="text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition">
          Cancelar
        </button>
        <span className="text-white text-sm font-medium">Câmera</span>
        {!captured && (
          <button onClick={handleSwitchCamera} className="text-white p-1.5 rounded-lg hover:bg-white/10 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        {captured && <div className="w-9" />}
      </div>

      {/* Camera / Preview */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {error ? (
          <div className="text-center p-6">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-white text-sm mb-4">{error}</p>
            <button onClick={onClose} className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold">
              Fechar
            </button>
          </div>
        ) : captured ? (
          <img src={captured} alt="Foto capturada" className="max-h-full max-w-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`max-h-full max-w-full object-contain ${ready ? '' : 'opacity-0'}`}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80 flex items-center justify-center gap-8">
        {captured ? (
          <>
            <button
              onClick={handleRetake}
              className="text-white text-sm font-medium px-5 py-2.5 rounded-lg border border-white/30 hover:bg-white/10 transition"
            >
              Tirar outra
            </button>
            <button
              onClick={handleConfirm}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Usar esta foto
            </button>
          </>
        ) : (
          <button
            onClick={handleCapture}
            disabled={!ready}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-30 transition hover:scale-105 active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
