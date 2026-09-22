export class AudioService {
  private static audioCtx: AudioContext | null = null;
  private static audioElement: HTMLAudioElement | null = null;
  private static gainNode: GainNode | null = null;
  private static sourceNode: MediaElementAudioSourceNode | null = null;

  public static playWelcomeAudio(src: string, volumePercent: number): void {
    if (volumePercent <= 0) return;

    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = 'anonymous';
      }

      this.audioElement.src = src;
      this.audioElement.currentTime = 0;

      // Initialize Web Audio Context for volume booster (>100% gain)
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.gainNode = this.audioCtx.createGain();
          this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
          this.sourceNode.connect(this.gainNode);
          this.gainNode.connect(this.audioCtx.destination);
        }
      }

      if (this.gainNode && this.audioCtx) {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        // Gain calculation: 100% -> 1.0, 150% -> 1.5
        this.gainNode.gain.value = volumePercent / 100;
        this.audioElement.volume = 1.0;
      } else {
        this.audioElement.volume = Math.min(volumePercent / 100, 1.0);
      }

      this.audioElement.play().catch(e => {
        console.warn('Welcome audio autoplay blocked or interrupted:', e);
      });
    } catch (e) {
      console.warn('Audio service failed to play audio:', e);
    }
  }

  public static setWelcomeVolume(volumePercent: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, volumePercent / 100);
    } else if (this.audioElement) {
      this.audioElement.volume = Math.min(Math.max(0, volumePercent / 100), 1.0);
    }
  }

  public static stopWelcomeAudio(): void {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (_e) {}
    }
  }
}