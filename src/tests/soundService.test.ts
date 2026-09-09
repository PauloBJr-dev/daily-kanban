import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  soundService,
  playWorkCompleteSound,
  playBreakCompleteSound,
  startCatPurr,
  stopCatPurr,
  previewCatPurr,
} from '../services/soundService'

describe('soundService', () => {
  let originalAudioContext: typeof window.AudioContext

  beforeEach(() => {
    originalAudioContext = window.AudioContext
    soundService.resetContextForTesting()
  })

  afterEach(() => {
    window.AudioContext = originalAudioContext
    soundService.resetContextForTesting()
    vi.restoreAllMocks()
  })

  it('executa playWorkCompleteSound e playBreakCompleteSound com seguran?a quando AudioContext n?o existe', () => {
    // @ts-expect-error Simula aus?ncia de AudioContext no ambiente
    window.AudioContext = undefined
    // @ts-expect-error Simula aus?ncia de webkitAudioContext
    window.webkitAudioContext = undefined

    expect(() => playWorkCompleteSound()).not.toThrow()
    expect(() => playBreakCompleteSound()).not.toThrow()
    expect(() => startCatPurr('soft')).not.toThrow()
    expect(() => stopCatPurr()).not.toThrow()
    expect(() => previewCatPurr('deep', 1)).not.toThrow()
  })

  it('sintetiza notas harm?nicas (C5, E5, G5) no playWorkCompleteSound quando AudioContext est? dispon?vel', () => {
    const createdOscillators: Array<{
      type: string
      frequency: { setValueAtTime: ReturnType<typeof vi.fn> }
      connect: ReturnType<typeof vi.fn>
      start: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
    }> = []

    const createdGains: Array<{
      gain: {
        setValueAtTime: ReturnType<typeof vi.fn>
        linearRampToValueAtTime: ReturnType<typeof vi.fn>
        exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
      }
      connect: ReturnType<typeof vi.fn>
    }> = []

    const resumeMock = vi.fn().mockResolvedValue(undefined)

    class MockAudioContext {
      currentTime = 10
      state = 'suspended'
      resume = resumeMock
      destination = {}
      createOscillator() {
        const osc = {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        }
        createdOscillators.push(osc)
        return osc
      }
      createGain() {
        const gain = {
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        }
        createdGains.push(gain)
        return gain
      }
    }

    window.AudioContext = MockAudioContext as unknown as typeof AudioContext

    playWorkCompleteSound()

    expect(resumeMock).toHaveBeenCalled()
    expect(createdOscillators.length).toBe(3)
    expect(createdGains.length).toBe(3)

    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(
      523.25,
      expect.any(Number)
    )
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(
      659.25,
      expect.any(Number)
    )
    expect(createdOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(
      783.99,
      expect.any(Number)
    )

    createdOscillators.forEach((osc) => {
      expect(osc.start).toHaveBeenCalled()
      expect(osc.stop).toHaveBeenCalled()
    })
  })

  it('sintetiza dois tons suaves no playBreakCompleteSound', () => {
    const createdOscillators: Array<{
      type: string
      frequency: { setValueAtTime: ReturnType<typeof vi.fn> }
      connect: ReturnType<typeof vi.fn>
      start: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
    }> = []

    class MockAudioContext {
      currentTime = 0
      state = 'running'
      resume = vi.fn()
      destination = {}
      createOscillator() {
        const osc = {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        }
        createdOscillators.push(osc)
        return osc
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        }
      }
    }

    window.AudioContext = MockAudioContext as unknown as typeof AudioContext

    playBreakCompleteSound()

    expect(createdOscillators.length).toBe(2)
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(
      523.25,
      expect.any(Number)
    )
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(
      659.25,
      expect.any(Number)
    )
  })

  it('sintetiza ronrom de gato nas varia??es soft, deep e rhythmic', () => {
    const createdOscillators: Array<{
      type: string
      frequency: { setValueAtTime: ReturnType<typeof vi.fn> }
      connect: ReturnType<typeof vi.fn>
      start: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
    }> = []

    const createdFilters: Array<{
      type: string
      frequency: { setValueAtTime: ReturnType<typeof vi.fn> }
      Q: { setValueAtTime: ReturnType<typeof vi.fn> }
      connect: ReturnType<typeof vi.fn>
    }> = []

    let createdBufferSource: {
      buffer: unknown
      loop: boolean
      connect: ReturnType<typeof vi.fn>
      start: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
    } | null = null

    class MockFullAudioContext {
      currentTime = 0
      sampleRate = 44100
      state = 'running'
      resume = vi.fn()
      destination = {}

      createBuffer(channels: number, length: number, sampleRate: number) {
        return {
          numberOfChannels: channels,
          length,
          sampleRate,
          getChannelData: () => new Float32Array(length),
        }
      }

      createBufferSource() {
        const source = {
          buffer: null,
          loop: false,
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          disconnect: vi.fn(),
        }
        createdBufferSource = source
        return source
      }

      createBiquadFilter() {
        const filter = {
          type: 'lowpass',
          frequency: { setValueAtTime: vi.fn() },
          Q: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
        }
        createdFilters.push(filter)
        return filter
      }

      createOscillator() {
        const osc = {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          disconnect: vi.fn(),
        }
        createdOscillators.push(osc)
        return osc
      }

      createGain() {
        return {
          gain: {
            value: 1,
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          disconnect: vi.fn(),
        }
      }
    }

    window.AudioContext = MockFullAudioContext as unknown as typeof AudioContext

    // 1. Testa varia??o 'soft'
    startCatPurr('soft', 0.8)
    expect(createdBufferSource).not.toBeNull()
    expect(createdBufferSource!.start).toHaveBeenCalled()
    expect(createdFilters.length).toBeGreaterThan(0)
    // Filtro para soft (cutoff 150)
    expect(createdFilters[0].frequency.setValueAtTime).toHaveBeenCalledWith(150, 0)
    // LFO lar?ngeo (~25Hz)
    expect(
      createdOscillators.some((o) =>
        o.frequency.setValueAtTime.mock.calls.some((c) => c[0] === 25)
      )
    ).toBe(true)

    // 2. Testa varia??o 'deep' (adiciona sub-grave em 26Hz)
    createdOscillators.length = 0
    startCatPurr('deep', 0.7)
    expect(
      createdOscillators.some((o) =>
        o.frequency.setValueAtTime.mock.calls.some((c) => c[0] === 26)
      )
    ).toBe(true)

    // 3. Testa varia??o 'rhythmic' (adiciona LFO de respira??o em 0.45Hz)
    createdOscillators.length = 0
    startCatPurr('rhythmic', 0.6)
    expect(
      createdOscillators.some((o) =>
        o.frequency.setValueAtTime.mock.calls.some((c) => c[0] === 0.45)
      )
    ).toBe(true)

    // 4. Testa interrup??o ao passar 'none'
    startCatPurr('none')

    // 5. Testa previewCatPurr
    vi.useFakeTimers()
    previewCatPurr('soft', 2)
    vi.advanceTimersByTime(2000)
    vi.useRealTimers()
  })

  it('trata com seguran?a exce??es disparadas dentro do AudioContext', () => {
    class MockAudioContext {
      currentTime = 0
      state = 'running'
      resume = vi.fn()
      createOscillator() {
        throw new Error('WebAudio failure')
      }
    }

    window.AudioContext = MockAudioContext as unknown as typeof AudioContext

    expect(() => playWorkCompleteSound()).not.toThrow()
    expect(() => playBreakCompleteSound()).not.toThrow()
    expect(() => startCatPurr('soft')).not.toThrow()
    expect(() => stopCatPurr()).not.toThrow()
  })
})
