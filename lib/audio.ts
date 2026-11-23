/**
 * Sintetizador de campana de cocina (Kitchen Bell) usando Web Audio API puro.
 * Produce un timbre metálico resonante y nítido para ser escuchado
 * en el ambiente ruidoso de una Dark Kitchen a varios metros de distancia.
 */

class KitchenSoundEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  /**
   * Desbloquea el AudioContext tras una interacción del usuario (tap o click)
   */
  public async unlock(): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('[Audio] No se pudo reanudar AudioContext:', e);
      }
    }
    this.isUnlocked = ctx.state === 'running';
    return this.isUnlocked;
  }

  public getUnlockedStatus(): boolean {
    const ctx = this.getContext();
    return Boolean(ctx && ctx.state === 'running');
  }

  /**
   * Toca una doble campana de servicio de restaurante ("Ding-Ding!")
   */
  public playKitchenBell(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => this.synthesizeChime(ctx)).catch(() => {});
    } else {
      this.synthesizeChime(ctx);
    }
  }

  private synthesizeChime(ctx: AudioContext): void {
    const now = ctx.currentTime;

    // Primer impacto (880 Hz - Nota La5)
    this.createBellStrike(ctx, now, 880, 0.45);

    // Segundo impacto ligeramente más agudo para llamar la atención en cocina (1046.5 Hz - Nota Do6)
    this.createBellStrike(ctx, now + 0.16, 1046.5, 0.55);
  }

  /**
   * Genera un impacto de campana de latón con armónicos y decaimiento exponencial
   */
  private createBellStrike(
    ctx: AudioContext,
    startTime: number,
    fundamentalFreq: number,
    volume: number
  ): void {
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(volume, startTime + 0.005); // Ataque ultra-rápido (percusión)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4); // Cola metálica larga

    // Armónicos de campana: Fundamental, segunda armónica y brillo metálico
    const harmonics = [
      { ratio: 1.0, gain: 0.6, type: 'sine' as OscillatorType },
      { ratio: 2.02, gain: 0.35, type: 'sine' as OscillatorType },
      { ratio: 3.14, gain: 0.2, type: 'triangle' as OscillatorType },
      { ratio: 4.85, gain: 0.12, type: 'sine' as OscillatorType },
    ];

    harmonics.forEach(({ ratio, gain: hGain, type }) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(fundamentalFreq * ratio, startTime);

      // Ligero vibrato para realismo de vibración de metal
      oscGain.gain.setValueAtTime(hGain, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 1.45);
    });
  }
}

export const kitchenAudio = new KitchenSoundEngine();
