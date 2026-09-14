import { soundService } from '../../services/soundService'

export type CompletionSoundType = 'marimba' | 'tibetan' | 'synthetic'

/**
 * Toca o som de teste para o toque de conclusão selecionado.
 * Utiliza Web Audio API nativa procedural com fallback seguro.
 */
export function playCompletionSound(type: CompletionSoundType): void {
  try {
    if (typeof window === 'undefined') return

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext

    if (!AudioContextClass) {
      soundService.playWorkCompleteSound()
      return
    }

    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    if (type === 'marimba') {
      // Arpeggio acústico suave estilo Marimba: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5]
      const noteDelay = 0.08

      notes.forEach((freq, index) => {
        const startTime = now + index * noteDelay
        const duration = 0.45

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.0001, startTime)
        gain.gain.linearRampToValueAtTime(0.14, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + duration)
      })
    } else if (type === 'tibetan') {
      // Ressonância profunda e calma de sino tibetano (~432Hz + harmônico suave de 864Hz)
      const duration = 1.6
      const freqs = [432, 864]

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        const peakGain = idx === 0 ? 0.16 : 0.06
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.linearRampToValueAtTime(peakGain, now + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + duration)
      })
    } else if (type === 'synthetic') {
      // Bip moderno e preciso (dois pulsos rápidos: 880Hz e 1320Hz)
      const pulses = [
        { freq: 880, start: now, dur: 0.09 },
        { freq: 1320, start: now + 0.11, dur: 0.12 },
      ]

      pulses.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.linearRampToValueAtTime(0.12, start + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + dur)
      })
    }
  } catch {
    soundService.playWorkCompleteSound()
  }
}
