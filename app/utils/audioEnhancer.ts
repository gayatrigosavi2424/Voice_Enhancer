import { ProcessingSettings } from '../components/AudioProcessor';

export class AudioEnhancer {
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async enhanceAudio(
    inputBuffer: AudioBuffer,
    settings: ProcessingSettings,
    onProgress?: (step: string) => void
  ): Promise<AudioBuffer> {
    try {
      onProgress?.('Starting enhancement...');
      
      // Create a copy of the input buffer
      let processedBuffer = this.copyAudioBuffer(inputBuffer);
      
      // Apply noise reduction
      if (settings.noiseReduction > 0) {
        onProgress?.('Reducing background noise...');
        processedBuffer = this.applySimpleNoiseReduction(processedBuffer, settings.noiseReduction);
      }
      
      // Apply voice enhancement
      if (settings.voiceEnhancement > 0) {
        onProgress?.('Enhancing voice clarity...');
        processedBuffer = this.applySimpleVoiceEnhancement(processedBuffer, settings.voiceEnhancement);
      }
      
      // Remove silence
      if (settings.silenceRemoval) {
        onProgress?.('Removing long pauses...');
        processedBuffer = this.applySimpleSilenceRemoval(processedBuffer, settings.silenceThreshold);
      }
      
      // Normalize volume
      if (settings.volumeNormalization) {
        onProgress?.('Normalizing audio levels...');
        processedBuffer = this.normalizeVolume(processedBuffer, settings.targetVolume);
      }
      
      onProgress?.('Enhancement complete!');
      return processedBuffer;
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      onProgress?.('Enhancement failed - using original audio');
      return inputBuffer;
    }
  }

  private copyAudioBuffer(buffer: AudioBuffer): AudioBuffer {
    const newBuffer = this.audioContext.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      newBuffer.copyToChannel(channelData, channel);
    }
    
    return newBuffer;
  }

  private applySimpleNoiseReduction(buffer: AudioBuffer, intensity: number): AudioBuffer {
    const newBuffer = this.copyAudioBuffer(buffer);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      
      // Calculate noise floor from quietest 20% of samples
      const sortedSamples = Array.from(channelData)
        .map(Math.abs)
        .sort((a, b) => a - b);
      const noiseFloor = sortedSamples[Math.floor(sortedSamples.length * 0.2)];
      
      // Apply gentle noise gate
      const threshold = noiseFloor * (1 + intensity * 3);
      
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.abs(channelData[i]);
        
        if (sample < threshold) {
          // Gentle reduction, not complete removal
          const reduction = Math.pow(sample / threshold, 0.5);
          channelData[i] *= reduction * (1 - intensity * 0.5);
        }
      }
    }
    
    return newBuffer;
  }

  private applySimpleVoiceEnhancement(buffer: AudioBuffer, intensity: number): AudioBuffer {
    const newBuffer = this.copyAudioBuffer(buffer);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      
      // Simple high-pass filter to reduce low-frequency noise
      this.applyHighPassFilter(channelData, 80);
      
      // Gentle mid-frequency boost for voice clarity
      this.applyMidBoost(channelData, intensity);
      
      // Light compression for consistency
      this.applyLightCompression(channelData, intensity);
    }
    
    return newBuffer;
  }

  private applyHighPassFilter(channelData: Float32Array, cutoffHz: number): void {
    const sampleRate = 44100;
    const rc = 1.0 / (cutoffHz * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = rc / (rc + dt);
    
    let prevInput = 0;
    let prevOutput = 0;
    
    for (let i = 0; i < channelData.length; i++) {
      const input = channelData[i];
      const output = alpha * (prevOutput + input - prevInput);
      
      // Mix with original to keep it gentle
      channelData[i] = channelData[i] * 0.8 + output * 0.2;
      
      prevInput = input;
      prevOutput = output;
    }
  }

  private applyMidBoost(channelData: Float32Array, intensity: number): void {
    // Simple emphasis filter for voice frequencies
    let prev = 0;
    
    for (let i = 0; i < channelData.length; i++) {
      const current = channelData[i];
      const emphasized = current + (current - prev) * intensity * 0.3;
      channelData[i] = current * (1 - intensity * 0.2) + emphasized * (intensity * 0.2);
      prev = current;
    }
  }

  private applyLightCompression(channelData: Float32Array, intensity: number): void {
    const threshold = 0.7;
    const ratio = 1 + intensity; // Very gentle compression
    
    for (let i = 0; i < channelData.length; i++) {
      const sample = channelData[i];
      const absSample = Math.abs(sample);
      
      if (absSample > threshold) {
        const excess = absSample - threshold;
        const compressedExcess = excess / ratio;
        const newLevel = threshold + compressedExcess;
        const gainReduction = newLevel / absSample;
        
        // Apply gentle compression
        channelData[i] = sample * (0.7 + gainReduction * 0.3);
      }
    }
  }

  private applySimpleSilenceRemoval(buffer: AudioBuffer, threshold: number): AudioBuffer {
    const channelData = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const minSilenceDuration = 1.0; // 1 second minimum
    const minSilenceSamples = Math.floor(minSilenceDuration * sampleRate);
    
    // Find silence regions
    const windowSize = Math.floor(0.1 * sampleRate); // 100ms window
    const silenceRegions: Array<{ start: number; end: number }> = [];
    let silenceStart = -1;
    
    for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
      // Calculate RMS for window
      let rms = 0;
      for (let j = 0; j < windowSize && i + j < channelData.length; j++) {
        rms += channelData[i + j] * channelData[i + j];
      }
      rms = Math.sqrt(rms / windowSize);
      
      const isQuiet = rms < threshold;
      
      if (isQuiet && silenceStart === -1) {
        silenceStart = i;
      } else if (!isQuiet && silenceStart !== -1) {
        const silenceDuration = i - silenceStart;
        if (silenceDuration >= minSilenceSamples) {
          // Keep some silence for natural flow
          const keepSamples = Math.floor(0.4 * sampleRate); // Keep 0.4 seconds
          silenceRegions.push({
            start: silenceStart + keepSamples,
            end: i - keepSamples
          });
        }
        silenceStart = -1;
      }
    }
    
    // If no significant silence found, return original
    if (silenceRegions.length === 0) {
      return buffer;
    }
    
    // Calculate new buffer length
    let removedSamples = 0;
    for (const region of silenceRegions) {
      if (region.end > region.start) {
        removedSamples += region.end - region.start;
      }
    }
    
    if (removedSamples < sampleRate * 0.5) {
      return buffer; // Don't bother if less than 0.5 seconds removed
    }
    
    const newLength = buffer.length - removedSamples;
    const newBuffer = this.audioContext.createBuffer(
      buffer.numberOfChannels,
      newLength,
      buffer.sampleRate
    );
    
    // Copy data excluding silence regions
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const sourceData = buffer.getChannelData(channel);
      const targetData = newBuffer.getChannelData(channel);
      
      let sourceIndex = 0;
      let targetIndex = 0;
      
      for (const region of silenceRegions) {
        // Copy data before silence region
        const copyLength = region.start - sourceIndex;
        for (let i = 0; i < copyLength; i++) {
          if (targetIndex < targetData.length) {
            targetData[targetIndex++] = sourceData[sourceIndex++];
          }
        }
        
        // Skip silence region
        sourceIndex = region.end;
      }
      
      // Copy remaining data
      while (sourceIndex < sourceData.length && targetIndex < targetData.length) {
        targetData[targetIndex++] = sourceData[sourceIndex++];
      }
    }
    
    return newBuffer;
  }

  private normalizeVolume(buffer: AudioBuffer, targetLevel: number): AudioBuffer {
    const newBuffer = this.copyAudioBuffer(buffer);
    
    // Find peak level across all channels
    let peakLevel = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        peakLevel = Math.max(peakLevel, Math.abs(channelData[i]));
      }
    }
    
    // Calculate normalization factor with safety margin
    const safeTargetLevel = targetLevel * 0.95; // 5% safety margin
    const normalizationFactor = peakLevel > 0 ? safeTargetLevel / peakLevel : 1;
    
    // Only normalize if it would make a significant difference
    if (normalizationFactor > 0.8 && normalizationFactor < 1.2) {
      return newBuffer; // Skip if change is minimal
    }
    
    // Apply normalization
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] *= normalizationFactor;
      }
    }
    
    return newBuffer;
  }
}