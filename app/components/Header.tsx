'use client';

import { Mic, Headphones } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Voice Enhancer Pro</h1>
              <p className="text-sm text-gray-500">Professional Audio Enhancement</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Headphones className="w-4 h-4" />
            <span>Use headphones for best results</span>
          </div>
        </div>
      </div>
    </header>
  );
}