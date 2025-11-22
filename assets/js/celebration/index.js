import { renderEmoji } from './emoji.js';
import { renderLottie } from './lottie.js';
import { playCelebrationSound } from './sound.js';

const registry = {
  emoji: { renderer: renderEmoji, sound: 'celebration-1', durationMs: 2500 },
  confetti: { renderer: renderLottie, sound: null, durationMs: 3000, file: 'confetti.json' },
  // fireworks er deaktivert pga. tung animasjon som kan henge nettleseren
  // fireworks: { renderer: renderLottie, sound: null, durationMs: 3500, file: 'fireworks.json' },
  emojiLottie: { renderer: renderLottie, sound: null, durationMs: 2500, file: 'emoji.json' },
  stars: { renderer: renderLottie, sound: null, durationMs: 3000, file: 'stars.json' },
  stars2: { renderer: renderLottie, sound: null, durationMs: 3000, file: 'stars2.json' },
  stars3: { renderer: renderLottie, sound: null, durationMs: 3000, file: 'stars3.json' },
  celebrate: { renderer: renderLottie, sound: null, durationMs: 3000, file: 'celebrate.json' }
};

function removeExistingCelebrations(target) {
  target.querySelectorAll('.viewer__celebration').forEach((el) => el.remove());
}

function pickRandomType() {
  const types = Object.keys(registry).filter((t) => t !== 'emoji');
  if (types.length === 0) return 'emoji';
  const idx = Math.floor(Math.random() * types.length);
  return types[idx];
}

export function showCelebration({
  type,
  target = document.body,
  durationMs,
  playSound = true,
  soundId
} = {}) {
  const chosenType = type && type !== 'random' ? type : pickRandomType();
  const entry = registry[chosenType] || registry.emoji;
  const renderer = entry.renderer || renderEmoji;
  const effectiveDuration = durationMs || entry.durationMs || 2500;
  const resolvedSoundId = soundId !== undefined ? soundId : entry.sound;

  // Løser renderer-ops for lottie
  const rendererOpts = { durationMs: effectiveDuration };
  if (entry.file) {
    rendererOpts.file = entry.file;
  }

  // Rydd opp eventuelle hengende overlays før ny start
  removeExistingCelebrations(target);

  try {
    const result = renderer(target, rendererOpts);
    if (result && typeof result.then === 'function') {
      result.catch((e) => {
        console.warn('Feiring feilet, fallback til emoji:', e);
        renderEmoji(target, { durationMs: effectiveDuration });
      });
    }
  } catch (e) {
    console.warn('Feiring feilet, fallback til emoji:', e);
    renderEmoji(target, { durationMs: effectiveDuration });
  }

  if (playSound !== false && resolvedSoundId) {
    playCelebrationSound(resolvedSoundId);
  }
}

export function setCelebrationType(typeName) {
  if (!typeName || typeName === 'random') return;
  if (!registry[typeName]) {
    console.warn(`Ukjent celebration type: ${typeName}`);
  }
}
