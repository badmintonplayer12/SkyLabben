import { loadProjectMeta, getImageUrl } from './data-loader.js';

/**
 * Lager et fullscreen-slideshow for en node med gallery
 * @param {{ nodePath: string }} options
 * @returns {Promise<HTMLElement>}
 */
export async function createSlideshowView({ nodePath }) {
  const cleanPath = (nodePath || '').replace(/^\/+/, '').replace(/\/+$/, '');
  if (!cleanPath) {
    throw new Error('Ugyldig path');
  }

  const meta = await loadProjectMeta(cleanPath);
  const gallery = Array.isArray(meta?.gallery) ? meta.gallery.filter(Boolean) : [];

  const rootEl = document.createElement('div');
  rootEl.className = 'slideshow';

  if (!gallery.length) {
    rootEl.innerHTML = `
      <div class="slideshow__chrome">
        <div class="slideshow__title">${meta?.name || 'Galleri'}</div>
        <button class="slideshow__close" type="button" aria-label="Lukk">&times;</button>
      </div>
      <div class="slideshow__empty">Ingen galleri for denne siden.</div>
    `;
    rootEl.querySelector('.slideshow__close')?.addEventListener('click', () => {
      history.back();
    });
    return rootEl;
  }

  const images = gallery.map((file) => ({
    url: getImageUrl(cleanPath, file),
    alt: meta?.name || ''
  }));

  let currentIndex = 0;

  rootEl.innerHTML = `
    <div class="slideshow__chrome">
      <div class="slideshow__title">${meta?.name || 'Galleri'}</div>
      <button class="slideshow__close" type="button" aria-label="Lukk">&times;</button>
    </div>
    <div class="slideshow__viewport">
      <button class="slideshow__nav slideshow__nav--prev" type="button" aria-label="Forrige">&#10094;</button>
      <img class="slideshow__image" alt="">
      <button class="slideshow__nav slideshow__nav--next" type="button" aria-label="Neste">&#10095;</button>
    </div>
    <div class="slideshow__dots" aria-hidden="true"></div>
  `;

  const imgEl = rootEl.querySelector('.slideshow__image');
  const dotsEl = rootEl.querySelector('.slideshow__dots');

  const render = () => {
    const item = images[currentIndex];
    imgEl.src = item.url;
    imgEl.alt = item.alt || '';
    dotsEl.innerHTML = images
      .map((_, i) => `<span class="slideshow__dot${i === currentIndex ? ' slideshow__dot--active' : ''}"></span>`)
      .join('');
  };

  const go = (delta) => {
    currentIndex = (currentIndex + delta + images.length) % images.length;
    render();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      go(-1);
    } else if (e.key === 'ArrowRight') {
      go(1);
    } else if (e.key === 'Escape') {
      close();
    }
  };

  const close = () => {
    window.removeEventListener('keydown', onKeyDown);
    history.back();
  };

  rootEl.querySelector('.slideshow__nav--prev')?.addEventListener('click', () => go(-1));
  rootEl.querySelector('.slideshow__nav--next')?.addEventListener('click', () => go(1));
  rootEl.querySelector('.slideshow__close')?.addEventListener('click', close);

  window.addEventListener('keydown', onKeyDown);

  render();
  return rootEl;
}
