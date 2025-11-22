const lottieCache = new Map();

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const resolvedSrc = new URL(src, window.location.href).href;
    const existing = document.querySelector(`script[src="${resolvedSrc}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      if (existing.dataset.loaded) resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = resolvedSrc;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = 'true';
      resolve();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureLottieLibs() {
  if (!window.lottie) {
    await loadScriptOnce('assets/js/lottie.min.js');
  }
}

async function loadAnimationData(file) {
  if (!file) throw new Error('Mangler fil for lottie');
  if (lottieCache.has(file)) return lottieCache.get(file);

  const url = new URL(`assets/animations/${file}`, window.location.href).href;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Kunne ikke laste lottie');
  const data = await res.json();
  lottieCache.set(file, data);
  return data;
}

export async function renderLottie(target, { file, durationMs = 2000 } = {}) {
  if (!file) return;
  await ensureLottieLibs();
  const animationData = await loadAnimationData(file);

  // Fjern gamle overlays før ny vises
  target.querySelectorAll('.viewer__celebration').forEach((el) => el.remove());

  const container = document.createElement('div');
  container.className = 'viewer__celebration viewer__celebration--lottie';
  target.appendChild(container);

  const anim = window.lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  });

  const cleanup = () => {
    anim.destroy();
    container.remove();
  };

  anim.addEventListener('complete', cleanup);
  anim.play();

  setTimeout(() => {
    cleanup();
  }, durationMs);
}
