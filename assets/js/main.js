/**
 * Hovedkoordinator for SkyLabben-applikasjonen
 * 
 * Dette er applikasjonens entry point som koordinerer routing, state og views.
 */

import { init as initRouter, parseHash, updateHash, getParentPath } from './router.js';
import { loadProjects, loadProjectMeta } from './data-loader.js';
import { getState, updateState, getLastStepFor, setStepFor, setInstallPromptAvailable } from './state.js';
import { renderProjectGrid } from './view-project-grid.js';
import { renderViewer } from './view-viewer.js';
import { showCelebration } from './celebration/index.js';
import { hasSeenOnboarding, showOnboarding, showOverlayMessage } from './onboarding.js';
import { initInstallPromptListener } from './pwa-install.js';

/**
 * Initialiserer applikasjonen
 * Kalles én gang når siden laster
 */
export function init() {
  initRouter((route) => {
    handleRoute(route);
  });

  const root = document.getElementById('app');
  if (root) {
    root.classList.add('app-container');
  }

  registerServiceWorker();
  initPWAInstall();
  initOfflineIndicator();
}

/**
 * Initialiserer PWA install prompt listener
 */
function initPWAInstall() {
  initInstallPromptListener((available) => {
    // Oppdater state når tilgjengelighet endres
    setInstallPromptAvailable(available);
    
    // Trigger re-render hvis vi er i viewer
    const state = getState();
    if (state.currentPath) {
      // Trigger hash-endring for å re-rendre viewer med ny install-knapp
      const currentHash = window.location.hash;
      updateHash(parseHash(currentHash));
    }
  });
}

/**
 * Håndterer ruteendringer
 * @param {Route} route - Route-objekt fra router
 */
async function handleRoute(route) {
  const root = document.getElementById('app');
  if (!root) {
    console.error('App container ikke funnet');
    return;
  }

  root.innerHTML = '';

  if (route.type === 'root') {
    const clearStatus = showStatus(root, {
      type: 'loading',
      title: 'Laster prosjekter …',
      message: 'Henter LEGO-modellene dine. Bare et lite øyeblikk!'
    });
    try {
      const projects = await loadProjects();
      clearStatus();
      root.innerHTML = '';
      const grid = renderProjectGrid(projects, (path) => {
        updateHash({ type: 'project', path });
      });
      root.appendChild(grid);

      if (!hasSeenOnboarding()) {
        showOnboarding(root, () => {});
      }
    } catch (error) {
      console.error('Kunne ikke laste prosjekter:', error);
      clearStatus();
      root.innerHTML = '';
      root.appendChild(createStatusElement({
        type: 'error',
        title: 'Oi! Kunne ikke laste prosjekter',
        message: 'Sjekk nettforbindelsen eller prøv igjen om et øyeblikk.',
        details: error?.message,
        actionLabel: 'Prøv igjen',
        onAction: () => handleRoute(route)
      }));
    }
  } else if (route.type === 'project') {
    const clearStatus = showStatus(root, {
      type: 'loading',
      title: 'Laster instruksjonene …',
      message: 'Vi finner frem byggetrinnene dine.'
    });
    try {
      const meta = await loadProjectMeta(route.path);
      clearStatus();
      root.innerHTML = '';
      const lastStep = route.stepIndex ?? getLastStepFor(route.path);

      updateState({
        currentPath: route.path,
        currentStepIndex: lastStep,
        currentProjectMeta: meta
      });

      const viewer = renderViewer(getState(), {
        onPrevStep: () => {
          const state = getState();
          const newIndex = Math.max(0, state.currentStepIndex - 1);
          updateState({ currentStepIndex: newIndex });
          setStepFor(state.currentPath, newIndex);
          updateHash({ type: 'project', path: state.currentPath, stepIndex: newIndex });
        },
        onNextStep: () => {
          const state = getState();
          const steps = state.currentProjectMeta?.steps || [];
          const maxIndex = steps.length > 0 ? steps.length - 1 : 0;
          const newIndex = Math.min(maxIndex, state.currentStepIndex + 1);
          updateState({ currentStepIndex: newIndex });
          setStepFor(state.currentPath, newIndex);
          updateHash({ type: 'project', path: state.currentPath, stepIndex: newIndex });

          if (newIndex === maxIndex && maxIndex >= 0 && steps.length >= 1) {
            setTimeout(() => {
              showCelebration(viewer);
            }, 300);
          }
        },
        onStepChange: (stepIndex) => {
          const stateBefore = getState();
          updateState({ currentStepIndex: stepIndex });
          const { currentPath, currentProjectMeta } = getState();
          setStepFor(currentPath, stepIndex);
          updateHash({ type: 'project', path: currentPath, stepIndex });

          // Bruk currentProjectMeta fra state (kan være undefined hvis ikke satt ennå)
          // Fallback til stateBefore hvis nødvendig
          const meta = currentProjectMeta || stateBefore.currentProjectMeta;
          const steps = meta?.steps || [];
          const maxIndex = steps.length > 0 ? steps.length - 1 : 0;
          
          // Trigger konfetti når vi når siste steg (stepIndex er 0-indeksert)
          if (stepIndex === maxIndex && maxIndex >= 0 && steps.length >= 1) {
            setTimeout(() => {
              showCelebration(viewer);
            }, 300);
          }
        },
        onGoUp: () => {
          const { currentPath } = getState();
          const parentPath = getParentPath(currentPath);
          if (parentPath) {
            updateHash({ type: 'project', path: parentPath });
          } else {
            updateHash({ type: 'root' });
          }
        },
        onProjectClick: (path) => {
          updateHash({ type: 'project', path });
        }
      });
      root.appendChild(viewer);
    } catch (error) {
      console.error(`Kunne ikke laste prosjekt ${route.path}:`, error);
      clearStatus();
      root.innerHTML = '';
      root.appendChild(createStatusElement({
        type: 'error',
        title: 'Fant ikke instruksjonene',
        message: 'Sjekk at prosjektet finnes, eller gå tilbake og velg et annet.',
        details: error?.message,
        actionLabel: 'Tilbake til galleri',
        onAction: () => updateHash({ type: 'root' })
      }));
    }
  }
}

function showStatus(root, options) {
  const element = createStatusElement(options);
  root.appendChild(element);
  return () => {
    if (element && element.parentNode === root) {
      root.removeChild(element);
    }
  };
}

function createStatusElement({ type = 'info', title, message, details, actionLabel, onAction }) {
  const wrapper = document.createElement('div');
  wrapper.className = `app-status app-status--${type}`;

  const icon = document.createElement('div');
  icon.className = 'app-status__icon';
  icon.textContent = type === 'error' ? '??' : '??';

  const titleEl = document.createElement('div');
  titleEl.className = 'app-status__title';
  titleEl.textContent = title || '';

  const messageEl = document.createElement('div');
  messageEl.className = 'app-status__message';
  messageEl.textContent = message || '';

  wrapper.appendChild(icon);
  wrapper.appendChild(titleEl);
  wrapper.appendChild(messageEl);

  if (details) {
    const detailsEl = document.createElement('div');
    detailsEl.className = 'app-status__details';
    detailsEl.textContent = details;
    wrapper.appendChild(detailsEl);
  }

  if (actionLabel && typeof onAction === 'function') {
    const button = document.createElement('button');
    button.className = 'app-status__button';
    button.type = 'button';
    button.textContent = actionLabel;
    button.addEventListener('click', onAction);
    wrapper.appendChild(button);
  }

  return wrapper;
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const swUrl = './service-worker.js';
  let hasReloadedFromUpdate = false;
  let updateOverlay = null;

  function removeUpdateOverlay() {
    if (updateOverlay && typeof updateOverlay.remove === 'function') {
      updateOverlay.remove();
    }
    updateOverlay = null;
  }

  function showUpdateOverlay(registration) {
    if (updateOverlay) return;
    updateOverlay = showOverlayMessage(document.body, {
      icon: '⬆️',
      lines: [
        'Ny versjon er tilgjengelig.',
        'Oppdater for å få siste forbedringer.'
      ],
      primaryLabel: 'Oppdater nå',
      onPrimary: () => {
        const waiting = registration.waiting;
        if (waiting) {
          waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          window.location.reload();
        }
      },
      secondaryLabel: 'Senere',
      onSecondary: () => removeUpdateOverlay(),
      allowBackdropDismiss: false
    });
  }

  function listenForWaitingServiceWorker(registration) {
    if (!registration) return;
    if (registration.waiting) {
      showUpdateOverlay(registration);
      return;
    }
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateOverlay(registration);
        }
      });
    });
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.info('Service worker registrert:', registration.scope);
        listenForWaitingServiceWorker(registration);
      })
      .catch((error) => {
        console.warn('Klarte ikke å registrere service worker:', error);
      });
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloadedFromUpdate) return;
    hasReloadedFromUpdate = true;
    removeUpdateOverlay();
    window.location.reload();
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          showUpdateOverlay(registration);
        }
      });
    }
  });

  // Sjekk for ventende SW også når appen får fokus / blir synlig (nyttig for PWA gjenopptak)
  function checkForWaitingServiceWorker() {
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;
      registration.update().catch(() => {});
      if (registration.waiting && navigator.serviceWorker.controller) {
        showUpdateOverlay(registration);
      }
    }).catch(() => {});
  }

  window.addEventListener('focus', checkForWaitingServiceWorker);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForWaitingServiceWorker();
    }
  });
}

/**
 * Initialiserer offline-indikator
 * Viser/skjuler indikator basert på nettverksstatus
 */
function initOfflineIndicator() {
  const chipNodes = () => Array.from(document.querySelectorAll('.offline-chip'));
  const hintNodes = () => Array.from(document.querySelectorAll('.offline-hint'));

  function updateOfflineStatus() {
    const isOnline = navigator.onLine;
    
    chipNodes().forEach((chip) => {
      if (isOnline) {
        chip.classList.remove('offline-chip--visible');
        chip.setAttribute('aria-hidden', 'true');
        chip.classList.remove('offline-chip--animate');
      } else {
        chip.classList.add('offline-chip--visible');
        chip.setAttribute('aria-hidden', 'false');
        chip.classList.add('offline-chip--animate');
        setTimeout(() => chip.classList.remove('offline-chip--animate'), 1800);
      }
    });

    if (!isOnline) {
      hintNodes().forEach((hint) => {
        hint.classList.add('offline-hint--visible');
        setTimeout(() => hint.classList.remove('offline-hint--visible'), 2200);
      });
    } else {
      hintNodes().forEach((hint) => hint.classList.remove('offline-hint--visible'));
    }
  }

  // Sjekk initial status
  updateOfflineStatus();

  // Lytte på online/offline events
  window.addEventListener('online', () => {
    updateOfflineStatus();
    console.info('Nettverk tilbake online');
  });

  window.addEventListener('offline', () => {
    updateOfflineStatus();
    console.warn('Nettverk offline');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
