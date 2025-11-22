export function renderEmoji(target, { durationMs = 2500 } = {}) {
  // Fjern alle gamle overlays før ny vises
  target.querySelectorAll('.viewer__celebration').forEach((el) => el.remove());

  const celebration = document.createElement('div');
  celebration.className = 'viewer__celebration';

  const emojis = ['🎉', '⭐', '🎊', '✨', '🏆'];
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'viewer__celebration-particle';
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 0.5}s`;
    celebration.appendChild(particle);
  }

  target.appendChild(celebration);

  const cleanup = () => {
    celebration.remove();
  };

  setTimeout(cleanup, durationMs);
  // Fallback i tilfelle timers throttles
  requestAnimationFrame(() => setTimeout(cleanup, durationMs));
}
