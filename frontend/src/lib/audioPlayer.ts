export class AudioStreamPlayer {
  private context: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private sampleRate = 24000; // Gemini Live API outputs at 24kHz

  async init() {
    if (this.context) return;
    
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioCtor({ sampleRate: this.sampleRate });
    
    // Browsers often suspend audio contexts created prior to user interaction
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    this.nextPlayTime = this.context.currentTime + 0.1;
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private activeSources: AudioBufferSourceNode[] = [];

  /**
   * Schedule the playback of a basic base64 encoded 16-bit PCM chunk
   * @param base64PcmData base64 encoded raw PCM data from Gemini Live API
   */
  playPcmChunk(base64PcmData: string) {
    if (!this.context) {
      console.warn("AudioContext not initialized. Call init() from a user gesture first.");
      return;
    }

    const arrayBuffer = this.base64ToArrayBuffer(base64PcmData);
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);

    // Convert 16-bit PCM to 32-bit float for Web Audio API
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = this.context.createBuffer(1, float32Array.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.context.destination);

    // Keep play schedule ahead of current time
    const currentTime = this.context.currentTime;
    if (this.nextPlayTime < currentTime) {
      // If we underflowed, start slightly in the future to build buffer
      this.nextPlayTime = currentTime + 0.05; 
    }

    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
    
    // Track active sources so we can stop them
    this.activeSources.push(source);
    source.onended = () => {
      const index = this.activeSources.indexOf(source);
      if (index > -1) {
        this.activeSources.splice(index, 1);
      }
    };
  }

  stop() {
    // Immediately stop and disconnect all scheduled audio
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }
    this.activeSources = [];
    
    // Reset our playhead
    if (this.context) {
      this.nextPlayTime = this.context.currentTime + 0.1;
    } else {
      this.nextPlayTime = 0;
    }
  }

  resume() {
    if (this.context) {
      this.context.resume();
    }
  }
}

// Export a singleton instance
export const audioPlayer = new AudioStreamPlayer();
