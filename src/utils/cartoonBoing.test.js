import { describe, expect, it, vi } from 'vitest'
import { playCartoonBoing } from './cartoonBoing.js'

function createAudioHarness() {
  const frequency = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  const gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  const oscillator = {
    type: '',
    frequency,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }
  const gainNode = { gain, connect: vi.fn() }
  const context = {
    currentTime: 4,
    state: 'running',
    destination: {},
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gainNode),
    resume: vi.fn(),
  }
  class FakeAudioContext {
    constructor() { return context }
  }
  return { FakeAudioContext, context, oscillator, gainNode, frequency, gain }
}

describe('playCartoonBoing', () => {
  it('creates a short pitch-drop sound and schedules cleanup', () => {
    const audio = createAudioHarness()

    expect(playCartoonBoing({ AudioContextClass: audio.FakeAudioContext, random: () => 0 })).toBe(true)
    expect(audio.context.createOscillator).toHaveBeenCalledOnce()
    expect(audio.context.createGain).toHaveBeenCalledOnce()
    expect(audio.oscillator.type).toBe('sine')
    expect(audio.frequency.setValueAtTime).toHaveBeenCalledWith(expect.any(Number), 4)
    expect(audio.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
    expect(audio.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, 4)
    expect(audio.oscillator.start).toHaveBeenCalledWith(4)
    expect(audio.oscillator.stop).toHaveBeenCalledWith(expect.any(Number))
  })

  it('selects three distinct boing variants', () => {
    const startingPitches = [0, 0.4, 0.9].map((randomValue) => {
      const audio = createAudioHarness()
      playCartoonBoing({ AudioContextClass: audio.FakeAudioContext, random: () => randomValue })
      return audio.frequency.setValueAtTime.mock.calls[0][0]
    })

    expect(new Set(startingPitches).size).toBe(3)
  })

  it('returns false when Web Audio is unavailable', () => {
    expect(playCartoonBoing({ AudioContextClass: undefined })).toBe(false)
  })
})
