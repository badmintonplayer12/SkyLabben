export function renderEmoji(target, { durationMs = 2500 } = {}) {
  const existing = target.querySelector('.viewer__celebration');
  if (existing) existing.remove();

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

  setTimeout(() => celebration.remove(), durationMs);
}
