const VARIANTS = Object.freeze([
  { startPitch: 520, endPitch: 88, duration: 0.34, volume: 0.17 },
  { startPitch: 650, endPitch: 118, duration: 0.28, volume: 0.15 },
  { startPitch: 430, endPitch: 72, duration: 0.4, volume: 0.18 },
])

const contexts = new WeakMap()

export function playCartoonBoing({
  AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext,
  random = Math.random,
} = {}) {
  if (!AudioContextClass) return false

  try {
    let context = contexts.get(AudioContextClass)
    if (!context) {
      context = new AudioContextClass()
      contexts.set(AudioContextClass, context)
    }
    if (context.state === 'suspended') context.resume?.().catch?.(() => {})

    const variant = VARIANTS[Math.min(VARIANTS.length - 1, Math.floor(random() * VARIANTS.length))]
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(variant.startPitch, now)
    oscillator.frequency.exponentialRampToValueAtTime(variant.endPitch, now + variant.duration)
    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(variant.volume, now + 0.018)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + variant.duration)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + variant.duration + 0.02)
    return true
  } catch {
    return false
  }
}
