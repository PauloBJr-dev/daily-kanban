/**
 * Serviço de áudio sintetizado para o DailyFlow Pomodoro.
 * Utiliza a Web Audio API nativa sem downloads externos nem dependências de rede.
 */

class SoundService {
  private audioCtx: AudioContext | null = null

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext

        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass()
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {
          // Autoplay policy pode bloquear o resume antes de interação do usuário
        })
      }

      return this.audioCtx
    } catch {
      return null
    }
  }

  /**
   * Redefine o contexto de áudio em memória (útil para testes unitários).
   */
  resetContextForTesting(): void {
    this.audioCtx = null
  }

  /**
   * Sintetiza um acorde harmônico agradável e suave (C5, E5, G5)
   * em sequência rápida para indicar a conclusão do bloco de foco.
   */
  playWorkCompleteSound(): void {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      // Notas: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
      const notes = [523.25, 659.25, 783.99]
      const noteDelay = 0.09 // arpeggio suave

      notes.forEach((freq, index) => {
        const startTime = now + index * noteDelay
        const duration = 0.5

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        // Envelope suave com ataque rápido e decaimento exponencial
        gain.gain.setValueAtTime(0.0001, startTime)
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + duration)
      })
    } catch {
      // Ignora falhas silenciosamente caso o navegador bloqueie áudio
    }
  }

  /**
   * Sintetiza dois tons suaves (C5 -> E5) para alertar o término do descanso
   * e o retorno ao ciclo de foco produtivo.
   */
  playBreakCompleteSound(): void {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      // Dois tons suaves indicando retorno ao foco: C5 (523.25Hz) e E5 (659.25Hz)
      const notes = [523.25, 659.25]
      const noteDelay = 0.14

      notes.forEach((freq, index) => {
        const startTime = now + index * noteDelay
        const duration = 0.45

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        // Envelope suave
        gain.gain.setValueAtTime(0.0001, startTime)
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + duration)
      })
    } catch {
      // Ignora falhas silenciosamente caso o navegador bloqueie áudio
    }
  }
}

export const soundService = new SoundService()
export const playWorkCompleteSound = () => soundService.playWorkCompleteSound()
export const playBreakCompleteSound = () => soundService.playBreakCompleteSound()
