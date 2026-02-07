'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Mic, FileAudio, AlertCircle } from 'lucide-react';

interface AudioUploaderProps {
  onAudioUpload: (file: File, buffer: AudioBuffer) => void;
}

export default function AudioUploader({ onAudioUpload }: AudioUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const processAudioFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      onAudioUpload(file, audioBuffer);
    } catch (err) {
      setError('Failed to process audio file. Please ensure it\'s a valid audio format.');
      console.error('Audio processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onAudioUpload]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/aac', 'audio/ogg', 'video/mp4', 'audio/mp4'];
    
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid audio file (WAV, MP3, M4A, AAC, OGG, MP4)');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB');
      return;
    }
    
    processAudioFile(file);
  }, [processAudioFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        
        stream.getTracks().forEach(track => track.stop());
        await processAudioFile(file);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* File Upload */}
      <div
        className={`card border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragOver 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-300'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            ) : (
              <Upload className="w-8 h-8 text-primary-500" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Processing Audio...' : 'Upload Audio File'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your audio file here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports WAV, MP3, M4A, AAC, OGG, MP4 • Max 100MB
            </p>
          </div>
          
          <button 
            className="btn-primary inline-flex items-center space-x-2"
            disabled={isProcessing}
          >
            <FileAudio className="w-4 h-4" />
            <span>Choose File</span>
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={isProcessing}
        />
      </div>
      
      {/* Divider */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-500 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      
      {/* Voice Recording */}
      <div className="card text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <Mic className={`w-8 h-8 ${isRecording ? 'text-red-500 animate-pulse' : 'text-red-400'}`} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Record Voice
          </h3>
          <p className="text-gray-600 mb-4">
            Record directly from your microphone
          </p>
          
          {isRecording && (
            <div className="text-red-500 font-mono text-xl mb-4">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`inline-flex items-center space-x-2 font-medium py-3 px-6 rounded-lg transition-colors duration-200 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-red-100 hover:bg-red-200 text-red-700'
          }`}
          disabled={isProcessing}
        >
          <Mic className="w-4 h-4" />
          <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </button>
      </div>
    </div>
  );
}