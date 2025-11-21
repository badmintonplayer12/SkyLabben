const audioCache = new Map();

export function playCelebrationSound(id) {
  if (!id) return;
  try {
    if (!audioCache.has(id)) {
      const audio = new Audio(`/assets/audio/${id}.mp3`);
      audioCache.set(id, audio);
    }
    const audio = audioCache.get(id);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn('Kunne ikke spille lyd:', e);
  }
}
