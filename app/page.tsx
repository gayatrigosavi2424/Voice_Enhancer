'use client';

import { useState } from 'react';
import AudioUploader from './components/AudioUploader';
import AudioProcessor from './components/AudioProcessor';
import Header from './components/Header';
import Features from './components/Features';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const handleAudioUpload = (file: File, buffer: AudioBuffer) => {
    setAudioFile(file);
    setAudioBuffer(buffer);
  };

  const handleReset = () => {
    setAudioFile(null);
    setAudioBuffer(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {!audioFile || !audioBuffer ? (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                Voice Enhancer
                <span className="text-primary-500"> Pro</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional audio enhancement for content creators and singers. 
                Remove background noise, enhance voice quality, and create perfect recordings.
              </p>
            </div>
            
            <AudioUploader onAudioUpload={handleAudioUpload} />
            <Features />
          </div>
        ) : audioBuffer ? (
          <AudioProcessor 
            audioFile={audioFile}
            audioBuffer={audioBuffer}
            onReset={handleReset}
          />
        ) : null}
      </div>
    </main>
  );
}