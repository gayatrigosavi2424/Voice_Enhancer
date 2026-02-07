'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  RotateCcw, 
  Settings,
  Volume2,
  Filter,
  Scissors,
  BarChart3
} from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';
import AudioControls from './AudioControls';
import ProcessingStatus from './ProcessingStatus';
import { AudioEnhancer } from '../utils/audioEnhancer';

interface AudioProcessorProps {
  audioFile: File;
  audioBuffer: AudioBuffer;
  onReset: () => void;
}

export interface ProcessingSettings {
  noiseReduction: number;
  voiceEnhancement: number;
  silenceRemoval: boolean;
  silenceThreshold: number;
  volumeNormalization: boolean;
  targetVolume: number;
}

export default function AudioProcessor({ 
  audioFile, 
  audioBuffer, 
  onReset 
}: AudioProcessorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<ProcessingSettings>({
    noiseReduction: 0.2,         // Very conservative
    voiceEnhancement: 0.3,       // Gentle enhancement
    silenceRemoval: true,
    silenceThreshold: 0.005,     // More sensitive detection
    volumeNormalization: true,
    targetVolume: 0.8            // Safe target volume
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const enhancerRef = useRef<AudioEnhancer | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    enhancerRef.current = new AudioEnhancer(audioContextRef.current);
    setDuration(audioBuffer.duration);
    
    // Auto-process with default settings
    processAudio();
    
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioBuffer]);

  // Update duration when processed buffer changes
  useEffect(() => {
    if (processedBuffer) {
      setDuration(processedBuffer.duration);
      setCurrentTime(0); // Reset playback position
    }
  }, [processedBuffer]);

  const processAudio = async () => {
    if (!enhancerRef.current || !audioBuffer) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Starting audio processing with settings:', settings);
      const processed = await enhancerRef.current.enhanceAudio(
        audioBuffer, 
        settings,
        setProcessingStep
      );
      console.log('Audio processing completed successfully');
      setProcessedBuffer(processed);
    } catch (error) {
      console.error('Audio processing failed:', error);
      setProcessingStep('Processing failed - using original audio');
      // Don't set processed buffer on error, keep original
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const playAudio = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    
    stopAudio();
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    const startTime = audioContextRef.current.currentTime;
    const startOffset = currentTime;
    source.start(0, startOffset);
    
    source.onended = () => {
      setIsPlaying(false);
      if (currentTime >= buffer.duration - 0.1) {
        setCurrentTime(0); // Reset to beginning if reached end
      }
    };
    
    sourceNodeRef.current = source;
    setIsPlaying(true);
    
    // Improved time tracking
    const updateTime = () => {
      if (isPlaying && audioContextRef.current && sourceNodeRef.current) {
        const elapsed = audioContextRef.current.currentTime - startTime + startOffset;
        if (elapsed < buffer.duration) {
          setCurrentTime(Math.min(elapsed, buffer.duration));
          requestAnimationFrame(updateTime);
        } else {
          setCurrentTime(buffer.duration);
          setIsPlaying(false);
        }
      }
    };
    
    // Start time updates immediately
    requestAnimationFrame(updateTime);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    const bufferToPlay = processedBuffer || audioBuffer;
    
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(bufferToPlay);
    }
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (isPlaying) {
      const bufferToPlay = processedBuffer || audioBuffer;
      playAudio(bufferToPlay);
    }
  };

  const downloadAudio = async () => {
    if (!processedBuffer || !audioContextRef.current) return;
    
    try {
      // Convert AudioBuffer to WAV
      const wav = await audioBufferToWav(processedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced_${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const audioBufferToWav = async (buffer: AudioBuffer): Promise<ArrayBuffer> => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return arrayBuffer;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audio Enhancement</h2>
          <p className="text-gray-600">{audioFile.name}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={onReset}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Audio</span>
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <ProcessingStatus step={processingStep} />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <AudioControls
          settings={settings}
          onSettingsChange={setSettings}
          onProcess={processAudio}
          isProcessing={isProcessing}
        />
      )}

      {/* Waveform Visualizer */}
      <div className="card">
        <WaveformVisualizer
          originalBuffer={audioBuffer}
          processedBuffer={processedBuffer}
          currentTime={currentTime}
          duration={duration}
          onSeek={seekTo}
        />
      </div>

      {/* Playback Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayback}
              className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full transition-colors duration-200"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            
            <div className="text-sm text-gray-600">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Volume2 className="w-4 h-4" />
              <span>
                {processedBuffer ? 'Enhanced Audio' : 'Original Audio'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {processedBuffer && (
              <>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      stopAudio();
                      setCurrentTime(0);
                      playAudio(audioBuffer);
                    }}
                    className="btn-secondary text-sm"
                  >
                    Play Original
                  </button>
                  <button
                    onClick={() => {
                      stopAudio();
                      setCurrentTime(0);
                      playAudio(processedBuffer);
                    }}
                    className="btn-secondary text-sm"
                  >
                    Play Enhanced
                  </button>
                </div>
                
                <button
                  onClick={downloadAudio}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Enhanced</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>0:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Enhancement Summary */}
      {processedBuffer && !isProcessing && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card text-center">
            <Filter className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Noise Reduced</h3>
            <p className="text-sm text-gray-600">{Math.round(settings.noiseReduction * 100)}%</p>
          </div>
          
          <div className="card text-center">
            <Volume2 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Voice Enhanced</h3>
            <p className="text-sm text-gray-600">{Math.round(settings.voiceEnhancement * 100)}%</p>
          </div>
          
          <div className="card text-center">
            <Scissors className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Silence Trimmed</h3>
            <p className="text-sm text-gray-600">{settings.silenceRemoval ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="card text-center">
            <BarChart3 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Volume Normalized</h3>
            <p className="text-sm text-gray-600">{settings.volumeNormalization ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
}