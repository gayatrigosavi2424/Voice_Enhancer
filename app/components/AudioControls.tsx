'use client';

import { ProcessingSettings } from './AudioProcessor';

interface AudioControlsProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function AudioControls({
  settings,
  onSettingsChange,
  onProcess,
  isProcessing
}: AudioControlsProps) {
  const updateSetting = (key: keyof ProcessingSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const presets = {
    podcast: {
      noiseReduction: 0.4,
      voiceEnhancement: 0.5,
      silenceRemoval: true,
      silenceThreshold: 0.008,
      volumeNormalization: true,
      targetVolume: 0.8
    },
    music: {
      noiseReduction: 0.2,
      voiceEnhancement: 0.3,
      silenceRemoval: false,
      silenceThreshold: 0.005,
      volumeNormalization: true,
      targetVolume: 0.85
    },
    interview: {
      noiseReduction: 0.5,
      voiceEnhancement: 0.6,
      silenceRemoval: true,
      silenceThreshold: 0.01,
      volumeNormalization: true,
      targetVolume: 0.75
    },
    gentle: {
      noiseReduction: 0.2,
      voiceEnhancement: 0.3,
      silenceRemoval: false,
      silenceThreshold: 0.005,
      volumeNormalization: true,
      targetVolume: 0.8
    }
  };

  const applyPreset = (preset: keyof typeof presets) => {
    onSettingsChange(presets[preset]);
  };

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Enhancement Settings</h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Presets:</span>
          <button
            onClick={() => applyPreset('gentle')}
            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
          >
            Gentle
          </button>
          <button
            onClick={() => applyPreset('podcast')}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
          >
            Podcast
          </button>
          <button
            onClick={() => applyPreset('music')}
            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
          >
            Music
          </button>
          <button
            onClick={() => applyPreset('interview')}
            className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
          >
            Interview
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Noise Reduction */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Noise Reduction
            </label>
            <span className="text-sm text-gray-500">
              {Math.round(settings.noiseReduction * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.noiseReduction}
            onChange={(e) => updateSetting('noiseReduction', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-gray-500">
            Remove background noise and unwanted sounds
          </p>
        </div>

        {/* Voice Enhancement */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Voice Enhancement
            </label>
            <span className="text-sm text-gray-500">
              {Math.round(settings.voiceEnhancement * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.voiceEnhancement}
            onChange={(e) => updateSetting('voiceEnhancement', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-gray-500">
            Boost clarity and richness of voice frequencies
          </p>
        </div>

        {/* Silence Removal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Smart Silence Removal
            </label>
            <input
              type="checkbox"
              checked={settings.silenceRemoval}
              onChange={(e) => updateSetting('silenceRemoval', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
          
          {settings.silenceRemoval && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">
                  Silence Threshold
                </label>
                <span className="text-xs text-gray-500">
                  {Math.round(settings.silenceThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.1"
                step="0.01"
                value={settings.silenceThreshold}
                onChange={(e) => updateSetting('silenceThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </>
          )}
          
          <p className="text-xs text-gray-500">
            Automatically remove long pauses while preserving natural rhythm
          </p>
        </div>

        {/* Volume Normalization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Volume Normalization
            </label>
            <input
              type="checkbox"
              checked={settings.volumeNormalization}
              onChange={(e) => updateSetting('volumeNormalization', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
          
          {settings.volumeNormalization && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">
                  Target Volume
                </label>
                <span className="text-xs text-gray-500">
                  {Math.round(settings.targetVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={settings.targetVolume}
                onChange={(e) => updateSetting('targetVolume', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </>
          )}
          
          <p className="text-xs text-gray-500">
            Ensure consistent audio levels throughout the recording
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center pt-4 border-t border-gray-200">
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Apply Enhancement'
          )}
        </button>
      </div>
    </div>
  );
}