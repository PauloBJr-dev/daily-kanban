import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  soundService,
  playWorkCompleteSound,
  playBreakCompleteSound,
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

  it('executa playWorkCompleteSound e playBreakCompleteSound com segurança quando AudioContext não existe', () => {
    // @ts-expect-error Simula ausência de AudioContext no ambiente
    window.AudioContext = undefined
    // @ts-expect-error Simula ausência de webkitAudioContext
    window.webkitAudioContext = undefined

    expect(() => playWorkCompleteSound()).not.toThrow()
    expect(() => playBreakCompleteSound()).not.toThrow()
  })

  it('sintetiza notas harmônicas (C5, E5, G5) no playWorkCompleteSound quando AudioContext está disponível', () => {
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

    // Testar com método exportado
    playWorkCompleteSound()

    expect(resumeMock).toHaveBeenCalled()
    expect(createdOscillators.length).toBe(3)
    expect(createdGains.length).toBe(3)

    // Frequências das 3 notas: C5 (523.25), E5 (659.25), G5 (783.99)
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

    // Verifica que todos os osciladores foram iniciados e agendados para parar
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

  it('trata com segurança exceções disparadas dentro do AudioContext', () => {
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
  })
})
