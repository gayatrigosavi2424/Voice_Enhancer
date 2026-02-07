'use client';

import { useEffect, useRef, useState } from 'react';

interface WaveformVisualizerProps {
  originalBuffer: AudioBuffer;
  processedBuffer: AudioBuffer | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function WaveformVisualizer({
  originalBuffer,
  processedBuffer,
  currentTime,
  duration,
  onSeek
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth - 32); // Account for padding
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    drawWaveform();
  }, [originalBuffer, processedBuffer, currentTime, canvasWidth]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Always show comparison if processed buffer exists
    const showComparison = processedBuffer !== null;
    const height = showComparison ? 300 : 150;
    canvas.height = height;
    canvas.width = canvasWidth;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, height);

    // Draw waveforms
    if (showComparison) {
      drawSingleWaveform(ctx, originalBuffer, 0, height / 2 - 10, '#94a3b8', 'Original Audio');
      drawSingleWaveform(ctx, processedBuffer!, height / 2 + 10, height / 2 - 10, '#3b82f6', 'Enhanced Audio');
      
      // Draw separator line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(canvasWidth, height / 2);
      ctx.stroke();
    } else {
      drawSingleWaveform(ctx, originalBuffer, 0, height, '#94a3b8', 'Original Audio');
    }

    // Draw enhanced progress indicator
    const currentBuffer = processedBuffer || originalBuffer;
    const progressX = (currentTime / currentBuffer.duration) * canvasWidth;
    
    // Progress line with glow effect
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Progress time indicator
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px system-ui';
    const timeText = formatTime(currentTime);
    const textWidth = ctx.measureText(timeText).width;
    const textX = Math.max(4, Math.min(canvasWidth - textWidth - 4, progressX - textWidth / 2));
    
    // Background for time text
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.fillRect(textX - 2, 4, textWidth + 4, 16);
    ctx.fillStyle = 'white';
    ctx.fillText(timeText, textX, 16);

    // Draw time markers
    drawTimeMarkers(ctx, height, currentBuffer.duration);
  };

  const drawSingleWaveform = (
    ctx: CanvasRenderingContext2D,
    buffer: AudioBuffer,
    yOffset: number,
    waveHeight: number,
    color: string,
    label?: string
  ) => {
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvasWidth);
    const amp = waveHeight / 2;

    // Draw label
    if (label) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui';
      ctx.fillText(label, 8, yOffset + 16);
    }

    // Draw waveform
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < canvasWidth; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const yMin = yOffset + amp + (min * amp * 0.8);
      const yMax = yOffset + amp + (max * amp * 0.8);

      if (i === 0) {
        ctx.moveTo(i, yMin);
      } else {
        ctx.lineTo(i, yMin);
      }
      ctx.lineTo(i, yMax);
    }

    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, yOffset + amp);
    ctx.lineTo(canvasWidth, yOffset + amp);
    ctx.stroke();
  };

  const drawTimeMarkers = (ctx: CanvasRenderingContext2D, height: number, audioDuration: number) => {
    const intervals = Math.max(4, Math.ceil(audioDuration / 10)); // Show markers every ~10 seconds, minimum 4 intervals
    const step = canvasWidth / intervals;

    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui';

    for (let i = 0; i <= intervals; i++) {
      const x = i * step;
      const time = (i / intervals) * audioDuration;
      const timeStr = formatTime(time);

      // Draw marker line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, height - 20);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Draw time label
      const textWidth = ctx.measureText(timeStr).width;
      ctx.fillText(timeStr, x - textWidth / 2, height - 5);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const currentBuffer = processedBuffer || originalBuffer;
    const clickTime = (x / canvasWidth) * currentBuffer.duration;
    onSeek(clickTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Audio Waveform</h3>
        
        <div className="flex items-center space-x-4 text-sm">
          {processedBuffer && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span className="text-gray-600">Original</span>
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-blue-600">Enhanced</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-gray-50 rounded-lg p-4 overflow-hidden border-2 border-gray-200">
        <canvas
          ref={canvasRef}
          className="w-full cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleCanvasClick}
          style={{ display: 'block' }}
        />
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Click anywhere on the waveform to seek to that position
        </div>
      </div>

      {processedBuffer && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <strong>Enhanced Audio Comparison</strong>
          </div>
          <p>
            The blue waveform shows your enhanced audio with noise reduction, voice enhancement, 
            and silence removal applied. The gray waveform shows the original for reference.
            Use the "Play Original" and "Play Enhanced" buttons to compare audio quality.
          </p>
        </div>
      )}
    </div>
  );
}