/**
 * Servi?o de ?udio sintetizado para o DailyFlow Pomodoro.
 * Utiliza a Web Audio API nativa sem downloads externos nem depend?ncias de rede.
 * Inclui s?ntese de ronrom de gato (Cat Purr) procedural com 3 varia??es ac?sticas.
 */

import type { CatPurrType } from '../types/kanban'

export type { CatPurrType }

interface ActivePurrSession {
  sourceNode?: AudioBufferSourceNode
  oscNodes: OscillatorNode[]
  gainNodes: GainNode[]
  masterGain: GainNode
}

class SoundService {
  private audioCtx: AudioContext | null = null
  private activePurr: ActivePurrSession | null = null
  private previewTimeout: ReturnType<typeof setTimeout> | null = null
  private noiseBuffer: AudioBuffer | null = null

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
          // Autoplay policy pode bloquear o resume antes de intera??o do usu?rio
        })
      }

      return this.audioCtx
    } catch {
      return null
    }
  }

  /**
   * Gera ou retorna o buffer de ru?do marrom/rosa suavizado para textura do ronrom
   */
  private getNoiseBuffer(ctx: AudioContext): AudioBuffer | null {
    try {
      if (typeof ctx.createBuffer !== 'function') return null

      if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== ctx.sampleRate) {
        const bufferSize = ctx.sampleRate * 2 // 2 segundos em loop
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        let lastOut = 0.0

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          lastOut = (lastOut + 0.025 * white) / 1.02
          data[i] = lastOut * 3.5
        }
        this.noiseBuffer = buffer
      }

      return this.noiseBuffer
    } catch {
      return null
    }
  }

  /**
   * Redefine o contexto de ?udio em mem?ria (?til para testes unit?rios).
   */
  resetContextForTesting(): void {
    this.stopCatPurr()
    this.audioCtx = null
    this.noiseBuffer = null
  }

  /**
   * Sintetiza um acorde harm?nico agrad?vel e suave (C5, E5, G5)
   * em sequ?ncia r?pida para indicar a conclus?o do bloco de foco.
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

        // Envelope suave com ataque r?pido e decaimento exponencial
        gain.gain.setValueAtTime(0.0001, startTime)
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + duration)
      })
    } catch {
      // Ignora falhas silenciosamente caso o navegador bloqueie ?udio
    }
  }

  /**
   * Sintetiza dois tons suaves (C5 -> E5) para alertar o t?rmino do descanso
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
      // Ignora falhas silenciosamente caso o navegador bloqueie ?udio
    }
  }

  /**
   * Inicia a s?ntese procedural cont?nua do ronrom de gato na Web Audio API.
   * Suporta 3 varia??es ac?sticas:
   * - 'soft': Ronrom suave e aveludado, calmo e cont?nuo (~25Hz lar?ngeo)
   * - 'deep': Ronrom profundo com vibra??o de peito baixa (~23.5Hz + sub-bass ~26Hz)
   * - 'rhythmic': Ronrom r?tmico com modula??o de inala??o/exala??o a cada ~2.2s
   */
  startCatPurr(type: CatPurrType, volume: number = 0.6): void {
    if (type === 'none') {
      this.stopCatPurr()
      return
    }

    // Para sess?o anterior se j? estiver ativa
    if (this.activePurr) {
      this.stopCatPurr()
    }

    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      const oscNodes: OscillatorNode[] = []
      const gainNodes: GainNode[] = []

      // 1. Ganho mestre com fade-in suave para conforto auditivo
      const masterGain = ctx.createGain()
      const safeVolume = Math.max(0, Math.min(1, volume))
      const targetGain = safeVolume * 0.4 // Volume equilibrado sem distor??o

      masterGain.gain.setValueAtTime(0.0001, now)
      if (typeof masterGain.gain.linearRampToValueAtTime === 'function') {
        masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.25)
      } else {
        masterGain.gain.value = targetGain
      }
      masterGain.connect(ctx.destination)
      gainNodes.push(masterGain)

      // 2. Ru?do marrom/rosa filtrado
      const noiseBuffer = this.getNoiseBuffer(ctx)
      let noiseSource: AudioBufferSourceNode | undefined

      if (noiseBuffer && typeof ctx.createBufferSource === 'function') {
        noiseSource = ctx.createBufferSource()
        noiseSource.buffer = noiseBuffer
        noiseSource.loop = true

        // Filtro passa-baixa calibrado por tipo ac?stico
        if (typeof ctx.createBiquadFilter === 'function') {
          const filter = ctx.createBiquadFilter()
          filter.type = 'lowpass'

          let cutoffFreq = 150
          let filterQ = 1.8

          if (type === 'deep') {
            cutoffFreq = 95
            filterQ = 3.2
          } else if (type === 'rhythmic') {
            cutoffFreq = 135
            filterQ = 2.0
          }

          filter.frequency.setValueAtTime(cutoffFreq, now)
          if (filter.Q) {
            filter.Q.setValueAtTime(filterQ, now)
          }

          // Tremolo lar?ngeo
          const tremoloGain = ctx.createGain()
          tremoloGain.gain.setValueAtTime(0.5, now)
          gainNodes.push(tremoloGain)

          const lfo = ctx.createOscillator()
          lfo.type = 'sine'
          const lfoRate = type === 'deep' ? 23.5 : 25
          lfo.frequency.setValueAtTime(lfoRate, now)

          const lfoGain = ctx.createGain()
          const lfoDepth = type === 'deep' ? 0.55 : type === 'rhythmic' ? 0.45 : 0.35
          lfoGain.gain.setValueAtTime(lfoDepth, now)
          gainNodes.push(lfoGain)

          lfo.connect(lfoGain)
          try {
            lfoGain.connect(tremoloGain.gain)
          } catch {
            // Em caso de mock sem AudioParam connect
            lfoGain.connect(tremoloGain)
          }
          oscNodes.push(lfo)

          // Varia??o r?tmica: modula??o de respira??o inala??o/exala??o a cada ~2.2s
          if (type === 'rhythmic') {
            const breathLfo = ctx.createOscillator()
            breathLfo.type = 'sine'
            breathLfo.frequency.setValueAtTime(0.45, now) // ~2.2s ciclo

            const breathFilterGain = ctx.createGain()
            breathFilterGain.gain.setValueAtTime(25, now)
            gainNodes.push(breathFilterGain)

            breathLfo.connect(breathFilterGain)
            try {
              breathFilterGain.connect(filter.frequency)
            } catch {
              breathFilterGain.connect(filter)
            }
            oscNodes.push(breathLfo)
          }

          noiseSource.connect(filter)
          filter.connect(tremoloGain)
          tremoloGain.connect(masterGain)
        } else {
          noiseSource.connect(masterGain)
        }

        noiseSource.start(now)
      }

      // 3. Sub-bass de vibra??o do peito para varia??o profunda ('deep')
      if (type === 'deep') {
        const chestOsc = ctx.createOscillator()
        chestOsc.type = 'sine'
        chestOsc.frequency.setValueAtTime(26, now) // 26Hz vibra??o corporal

        const chestGain = ctx.createGain()
        chestGain.gain.setValueAtTime(0.28, now)
        gainNodes.push(chestGain)

        chestOsc.connect(chestGain)
        chestGain.connect(masterGain)
        oscNodes.push(chestOsc)
      }

      // Inicia todos os osciladores
      oscNodes.forEach((osc) => {
        try {
          osc.start(now)
        } catch {
          // Ignora falhas em n?s j? iniciados
        }
      })

      this.activePurr = {
        sourceNode: noiseSource,
        oscNodes,
        gainNodes,
        masterGain,
      }
    } catch {
      this.activePurr = null
    }
  }

  /**
   * Para a s?ntese do ronrom com decaimento suave (fade-out sem cliques).
   */
  stopCatPurr(): void {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout)
      this.previewTimeout = null
    }

    if (!this.activePurr) return

    const { sourceNode, oscNodes, gainNodes, masterGain } = this.activePurr
    this.activePurr = null

    try {
      const ctx = this.getAudioContext()
      if (ctx && masterGain) {
        const now = ctx.currentTime
        if (typeof masterGain.gain.linearRampToValueAtTime === 'function') {
          masterGain.gain.setValueAtTime(masterGain.gain.value || 0.1, now)
          masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.15)
        }

        setTimeout(() => {
          try {
            if (sourceNode) {
              sourceNode.stop()
              sourceNode.disconnect()
            }
            oscNodes.forEach((osc) => {
              try {
                osc.stop()
                osc.disconnect()
              } catch {
                // Silencia falha se j? parado
              }
            })
            gainNodes.forEach((gain) => {
              try {
                gain.disconnect()
              } catch {
                // Silencia falha
              }
            })
          } catch {
            // Silencia
          }
        }, 160)
      } else {
        if (sourceNode) sourceNode.stop()
        oscNodes.forEach((osc) => osc.stop())
      }
    } catch {
      // Silencia
    }
  }

  /**
   * Toca uma pr?via tempor?ria do ronrom selecionado por uma dura??o definida (padr?o 3 segundos).
   */
  previewCatPurr(type: CatPurrType, duration: number = 3): void {
    if (type === 'none') {
      this.stopCatPurr()
      return
    }

    this.startCatPurr(type, 0.6)

    this.previewTimeout = setTimeout(
      () => {
        this.stopCatPurr()
      },
      Math.max(1, duration) * 1000
    )
  }
}

export const soundService = new SoundService()
export const playWorkCompleteSound = () => soundService.playWorkCompleteSound()
export const playBreakCompleteSound = () => soundService.playBreakCompleteSound()
export const startCatPurr = (type: CatPurrType, volume?: number) =>
  soundService.startCatPurr(type, volume)
export const stopCatPurr = () => soundService.stopCatPurr()
export const previewCatPurr = (type: CatPurrType, duration?: number) =>
  soundService.previewCatPurr(type, duration)
