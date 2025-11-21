const lottieCache = new Map();

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      if (existing.dataset.loaded) resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
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
    await loadScriptOnce('/assets/js/lottie.min.js');
  }
}

async function loadAnimationData(file) {
  if (!file) throw new Error('Mangler fil for lottie');
  if (lottieCache.has(file)) return lottieCache.get(file);

  const res = await fetch(`/assets/animations/${file}`);
  if (!res.ok) throw new Error('Kunne ikke laste lottie');
  const data = await res.json();
  lottieCache.set(file, data);
  return data;
}

export async function renderLottie(target, { file, durationMs = 2000 } = {}) {
  if (!file) return;
  await ensureLottieLibs();
  const animationData = await loadAnimationData(file);

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

  anim.play();

  setTimeout(() => {
    anim.destroy();
    container.remove();
  }, durationMs);
}
