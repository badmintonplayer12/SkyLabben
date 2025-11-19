/**
 * Instruksjonsviewer-view
 * 
 * Renderer instruksjonsbilde med navigasjonskontroller.
 */

import { getImageUrl, getAudioUrl, loadProjectMeta } from './data-loader.js';
import { getLastStepFor, resetProgressFor } from './state.js';
import { playNavigationSound, isAudioEnabled, setAudioEnabled } from './audio-feedback.js';

/**
 * Renderer instruksjonsviewer
 * @param {AppState} state - Nåværende applikasjonsstate
 * @param {Object} callbacks - Callback-funksjoner fra main.js
 * @param {function(): void} callbacks.onPrevStep - Kalles når forrige steg klikkes
 * @param {function(): void} callbacks.onNextStep - Kalles når neste steg klikkes
 * @param {function(number): void} callbacks.onStepChange - Kalles når steg endres (tar stepIndex)
 * @param {function(): void} callbacks.onGoUp - Kalles når "Opp"-knapp klikkes
 * @returns {HTMLElement} Container-element med viewer
 * 
 * Viktig: View gjør IKKE direkte state/URL-oppdateringer. Den kaller callbacks som sendes
 * fra main.js, og main.js eier all state/URL-manipulasjon. Hvis steps-array er tomt,
 * vis "Ingen steg tilgjengelig" og deaktiver navigasjonskontroller.
 * Filtrer bort children med hidden: true når children-liste vises.
 */
export function renderViewer(state, callbacks) {
  const container = document.createElement('div');
  container.className = 'viewer';
  
  // Header
  const header = document.createElement('div');
  header.className = 'viewer__header';
  header.textContent = state.currentProjectMeta?.name || '';
  
  // Image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'viewer__main';
  
  // Håndter tom steps-array
  const steps = state.currentProjectMeta?.steps || [];
  const visibleChildren = (state.currentProjectMeta?.children || []).filter(c => !c.hidden);
  
  // Legg til scrollable-stiler hvis det er children å vise
  if (steps.length === 0 && visibleChildren.length > 0) {
    imageContainer.style.overflowY = 'auto';
    imageContainer.style.overflowX = 'hidden';
    imageContainer.style.alignItems = 'flex-start';
    imageContainer.style.justifyContent = 'flex-start';
  }
  
  // Bottom bar: Har fast høyde slik at hovedbildet alltid kan bruke resten av høyden
  const bottomBar = document.createElement('div');
  bottomBar.className = 'viewer__bottom';
  
  // Opp-knapp (ikon: hus for hjem/opp)
  const upButton = document.createElement('button');
  upButton.className = 'viewer__button viewer__button--up';
  upButton.innerHTML = '<span class="viewer__icon" aria-hidden="true">🏠</span>';
  upButton.setAttribute('aria-label', 'Gå tilbake');
  upButton.title = 'Gå tilbake';
  upButton.addEventListener('click', () => {
    playNavigationSound('up');
    callbacks.onGoUp();
  });
  
  // Progresjonslinje (skjul hvis ingen steg)
  const progressBar = document.createElement('input');
  progressBar.className = 'viewer__progress';
  progressBar.type = 'range';
  progressBar.min = 0;
  progressBar.max = Math.max(0, steps.length - 1);
  progressBar.value = state.currentStepIndex;
  progressBar.disabled = steps.length === 0;
  if (steps.length > 0) {
    progressBar.addEventListener('input', (e) => {
      callbacks.onStepChange(parseInt(e.target.value, 10));
    });
  }
  
  // Pil-knapper (store ikoner for barn)
  const prevButton = document.createElement('button');
  prevButton.className = 'viewer__button viewer__button--prev';
  prevButton.innerHTML = '<span class="viewer__icon" aria-hidden="true">◀️</span>';
  prevButton.setAttribute('aria-label', 'Forrige steg');
  prevButton.title = 'Forrige steg';
  prevButton.disabled = steps.length === 0 || state.currentStepIndex === 0;
  if (steps.length > 0 && state.currentStepIndex > 0) {
    prevButton.addEventListener('click', () => {
      playNavigationSound('prev');
      callbacks.onPrevStep();
    });
  }
  
  const nextButton = document.createElement('button');
  nextButton.className = 'viewer__button viewer__button--next';
  nextButton.innerHTML = '<span class="viewer__icon" aria-hidden="true">▶️</span>';
  nextButton.setAttribute('aria-label', 'Neste steg');
  nextButton.title = 'Neste steg';
  nextButton.disabled = steps.length === 0 || state.currentStepIndex === (steps.length - 1);
  if (steps.length > 0 && state.currentStepIndex < (steps.length - 1)) {
    nextButton.addEventListener('click', () => {
      playNavigationSound('next');
      callbacks.onNextStep();
    });
  }
  
  // Steg-indikator
  const stepIndicator = document.createElement('div');
  stepIndicator.className = 'viewer__step-indicator';
  stepIndicator.textContent = steps.length === 0 
    ? 'Ingen steg tilgjengelig'
    : `${state.currentStepIndex + 1}/${steps.length}`;
  
  if (steps.length === 0) {
    // Hvis ingen steg, vis children-liste eller melding
    if (visibleChildren.length > 0) {
      // Vis children-liste
      const childrenGrid = document.createElement('div');
      childrenGrid.className = 'project-grid';
      
      visibleChildren.forEach(child => {
        const tile = document.createElement('div');
        tile.className = 'project-tile';
        tile.setAttribute('data-path', `${state.currentPath}/${child.path}`);
        
        const img = document.createElement('img');
        img.className = 'project-tile__image';
        img.src = getImageUrl(`${state.currentPath}/${child.path}`, 'cover.png');
        img.alt = child.name;
        img.onerror = async () => {
          // Fallback til siste bilde hvis cover.png ikke finnes
          try {
            const childMeta = await loadProjectMeta(`${state.currentPath}/${child.path}`);
            const steps = childMeta.steps || [];
            if (steps.length > 0) {
              // Bruk siste bilde i steps-arrayet
              const lastStep = steps[steps.length - 1];
              img.src = getImageUrl(`${state.currentPath}/${child.path}`, lastStep);
            } else {
              // Hvis ingen steps, skjul bildet
              img.style.display = 'none';
            }
          } catch (error) {
            // Hvis vi ikke kan laste meta.json, skjul bildet
            console.warn(`Kunne ikke laste meta.json for ${state.currentPath}/${child.path}, skjuler cover-bilde`);
            img.style.display = 'none';
          }
        };
        
        const name = document.createElement('div');
        name.className = 'project-tile__name';
        name.textContent = child.name;
        
        // Progresjonsindikator (lastes asynkront)
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'project-tile__progress';
        
        // Last meta for å få totalt antall steg og vis progresjon
        loadProjectMeta(`${state.currentPath}/${child.path}`).then(childMeta => {
          const childSteps = childMeta.steps || [];
          const totalSteps = childSteps.length;
          const lastStep = getLastStepFor(`${state.currentPath}/${child.path}`);
          
          if (totalSteps > 0 && lastStep > 0) {
            const progressPercent = ((lastStep + 1) / totalSteps) * 100;
            progressIndicator.style.width = `${progressPercent}%`;
            progressIndicator.setAttribute('aria-label', `${lastStep + 1}/${totalSteps} steg`);
            progressIndicator.classList.add('project-tile__progress--visible');
          } else {
            progressIndicator.style.display = 'none';
          }
        }).catch((error) => {
          console.warn(`Kunne ikke laste meta for progresjon: ${state.currentPath}/${child.path}`, error);
          progressIndicator.style.display = 'none';
        });
        
        tile.appendChild(img);
        tile.appendChild(name);
        tile.appendChild(progressIndicator);
        
        tile.addEventListener('click', () => {
          if (callbacks.onProjectClick) {
            callbacks.onProjectClick(`${state.currentPath}/${child.path}`);
          }
        });
        
        childrenGrid.appendChild(tile);
      });
      
      imageContainer.appendChild(childrenGrid);
    } else {
      // Vis melding
      const message = document.createElement('div');
      message.className = 'viewer__empty-message';
      message.textContent = 'Ingen steg tilgjengelig';
      imageContainer.appendChild(message);
    }
  } else {
    // Loading-indikator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'viewer__loading';
    const loadingIcon = document.createElement('div');
    loadingIcon.className = 'viewer__loading-icon';
    loadingIcon.textContent = '⏳'; // Placeholder - kan erstattes med SVG senere
    loadingIndicator.appendChild(loadingIcon);
    
    // Bilde-rendering: Bildet skal fylle tilgjengelig plass innenfor viewport
    const img = document.createElement('img');
    const currentStep = steps[state.currentStepIndex];
    if (currentStep) {
      img.src = getImageUrl(state.currentPath, currentStep);
      img.alt = `Steg ${state.currentStepIndex + 1}`;
      
      // Sjekk om bildet allerede er lastet (fra cache)
      if (!img.complete || img.naturalWidth === 0) {
        // Bildet er ikke lastet ennå - vis loading-indikator og deaktiver knapper
        img.style.display = 'none';
        imageContainer.appendChild(loadingIndicator);
        prevButton.disabled = true;
        nextButton.disabled = true;
        progressBar.disabled = true;
      } else {
        // Bildet er allerede lastet - skjul loading-indikator
        loadingIndicator.style.display = 'none';
      }
      
      img.onload = () => {
        // Skjul loading-indikator og vis bilde
        if (loadingIndicator.parentNode) {
          loadingIndicator.remove();
        }
        img.style.display = 'block';
        // Aktiver knapper
        prevButton.disabled = steps.length === 0 || state.currentStepIndex === 0;
        nextButton.disabled = steps.length === 0 || state.currentStepIndex === (steps.length - 1);
        progressBar.disabled = false;
        
        // Preload neste bilde for raskere navigasjon
        if (state.currentStepIndex < steps.length - 1) {
          const nextStep = steps[state.currentStepIndex + 1];
          if (nextStep) {
            const nextImg = new Image();
            nextImg.src = getImageUrl(state.currentPath, nextStep);
          }
        }
        
        // Preload forrige bilde hvis ikke på første steg
        if (state.currentStepIndex > 0) {
          const prevStep = steps[state.currentStepIndex - 1];
          if (prevStep) {
            const prevImg = new Image();
            prevImg.src = getImageUrl(state.currentPath, prevStep);
          }
        }
      };
      
      img.onerror = () => {
        // Skjul loading-indikator og vis brukervennlig feilmelding
        if (loadingIndicator.parentNode) {
          loadingIndicator.remove();
        }
        img.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.className = 'viewer__empty-message';
        errorMsg.textContent = 'Oi! Fant ikke bildet – spør en voksen';
        imageContainer.appendChild(errorMsg);
        // Aktiver knapper igjen så bruker kan navigere videre
        prevButton.disabled = steps.length === 0 || state.currentStepIndex === 0;
        nextButton.disabled = steps.length === 0 || state.currentStepIndex === (steps.length - 1);
        progressBar.disabled = false;
      };
    }
    imageContainer.appendChild(img);
  }
  
  // Audio toggle-knapp (kun hvis det er steg)
  if (steps.length > 0) {
    const audioToggleButton = document.createElement('button');
    audioToggleButton.className = 'viewer__button viewer__button--audio';
    audioToggleButton.innerHTML = `<span class="viewer__icon" aria-hidden="true">${isAudioEnabled() ? '🔊' : '🔇'}</span>`;
    audioToggleButton.setAttribute('aria-label', isAudioEnabled() ? 'Skru av lyd' : 'Skru på lyd');
    audioToggleButton.title = isAudioEnabled() ? 'Skru av lyd' : 'Skru på lyd';
    audioToggleButton.addEventListener('click', () => {
      const newState = !isAudioEnabled();
      setAudioEnabled(newState);
      audioToggleButton.innerHTML = `<span class="viewer__icon" aria-hidden="true">${newState ? '🔊' : '🔇'}</span>`;
      audioToggleButton.setAttribute('aria-label', newState ? 'Skru av lyd' : 'Skru på lyd');
      audioToggleButton.title = newState ? 'Skru av lyd' : 'Skru på lyd';
    });
    bottomBar.appendChild(audioToggleButton);
  }
  
  // Audio-knapp for steg-vis lydhint (hvis audioSteps finnes)
  const audioSteps = state.currentProjectMeta?.audioSteps || [];
  if (steps.length > 0 && audioSteps.length > 0 && state.currentStepIndex < audioSteps.length) {
    const audioStep = audioSteps[state.currentStepIndex];
    if (audioStep) {
      const audioButton = document.createElement('button');
      audioButton.className = 'viewer__button viewer__button--audio-step';
      audioButton.innerHTML = '<span class="viewer__icon" aria-hidden="true">🎵</span>';
      audioButton.setAttribute('aria-label', 'Spill av lydhint for dette steg');
      audioButton.title = 'Spill av lydhint';
      audioButton.addEventListener('click', () => {
        const audio = new Audio(getAudioUrl(state.currentPath, audioStep));
        audio.play().catch((error) => {
          console.warn('Kunne ikke spille lyd:', error);
          // Vis brukervennlig melding hvis lyd ikke kan spilles
          const errorMsg = document.createElement('div');
          errorMsg.className = 'viewer__empty-message';
          errorMsg.textContent = 'Oi! Kunne ikke spille lyd – spør en voksen';
          errorMsg.style.position = 'fixed';
          errorMsg.style.top = '50%';
          errorMsg.style.left = '50%';
          errorMsg.style.transform = 'translate(-50%, -50%)';
          errorMsg.style.zIndex = '1001';
          errorMsg.style.background = 'var(--color-background)';
          errorMsg.style.padding = 'var(--spacing-lg)';
          errorMsg.style.borderRadius = 'var(--border-radius)';
          errorMsg.style.boxShadow = 'var(--shadow)';
          container.appendChild(errorMsg);
          setTimeout(() => {
            errorMsg.remove();
          }, 3000);
        });
      });
      bottomBar.appendChild(audioButton);
    }
  }
  
  // QR-kode-knapp (kun hvis det er steg) - for voksne
  if (steps.length > 0) {
    const qrButton = document.createElement('button');
    qrButton.className = 'viewer__button viewer__button--qr';
    qrButton.innerHTML = '<span class="viewer__icon" aria-hidden="true">📱</span>';
    qrButton.setAttribute('aria-label', 'Vis QR-kode');
    qrButton.title = 'Vis QR-kode';
    qrButton.addEventListener('click', async () => {
      // Vis QR-kode-modal
      const modal = document.createElement('div');
      modal.className = 'qr-modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'qr-modal__content';
      
      const modalHeader = document.createElement('div');
      modalHeader.className = 'qr-modal__header';
      modalHeader.textContent = 'QR-kode';
      
      const qrContainer = document.createElement('div');
      qrContainer.className = 'qr-modal__container';
      
      const closeButton = document.createElement('button');
      closeButton.className = 'qr-modal__close';
      closeButton.innerHTML = '<span class="viewer__icon" aria-hidden="true">✕</span>';
      closeButton.setAttribute('aria-label', 'Lukk');
      closeButton.title = 'Lukk';
      closeButton.addEventListener('click', () => {
        modal.remove();
      });
      
      // Generer QR-kode for nåværende steg
      const baseUrl = window.location.origin;
      await generateQRCodeForStep(baseUrl, state.currentPath, state.currentStepIndex, qrContainer);
      
      modalContent.appendChild(modalHeader);
      modalContent.appendChild(qrContainer);
      modalContent.appendChild(closeButton);
      modal.appendChild(modalContent);
      container.appendChild(modal);
      
      // Lukk ved klikk utenfor
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    });
    bottomBar.appendChild(qrButton);
  }
  
  // Nullstill-knapp (kun hvis det er steg)
  if (steps.length > 0) {
    const resetButton = document.createElement('button');
    resetButton.className = 'viewer__button viewer__button--reset';
    resetButton.textContent = '🔄';
    resetButton.setAttribute('aria-label', 'Nullstill progresjon');
    resetButton.title = 'Nullstill progresjon';
    resetButton.addEventListener('click', () => {
      if (confirm('Vil du nullstille progresjonen for dette prosjektet?')) {
        resetProgressFor(state.currentPath);
        // Naviger til første steg
        if (callbacks.onStepChange) {
          callbacks.onStepChange(0);
        }
      }
    });
    bottomBar.appendChild(resetButton);
  }
  
  bottomBar.appendChild(upButton);
  bottomBar.appendChild(prevButton);
  bottomBar.appendChild(progressBar);
  bottomBar.appendChild(nextButton);
  bottomBar.appendChild(stepIndicator);
  
  container.appendChild(header);
  container.appendChild(imageContainer);
  container.appendChild(bottomBar);
  
  // Tastaturnavigasjon og touch gestures (kun hvis det er steg)
  if (steps.length > 0) {
    const handleKeyDown = (e) => {
      // Arrow keys for neste/forrige steg
      if (e.key === 'ArrowLeft' || e.key === 'Left') {
        if (!prevButton.disabled && callbacks.onPrevStep) {
          e.preventDefault();
          callbacks.onPrevStep();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        if (!nextButton.disabled && callbacks.onNextStep) {
          e.preventDefault();
          callbacks.onNextStep();
        }
      } else if (e.key === 'Escape') {
        // Escape-tast for å gå tilbake
        e.preventDefault();
        callbacks.onGoUp();
      }
    };
    
    // Legg til event listener på document (fungerer uavhengig av fokus)
    document.addEventListener('keydown', handleKeyDown);
    
    // Touch gestures for swipe venstre/høyre
    let touchStartX = null;
    let touchStartY = null;
    const minSwipeDistance = 50; // Minimum avstand for å registrere swipe
    const maxVerticalDistance = 100; // Maksimal vertikal avstand for å unngå konflikt med scroll
    
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };
    
    const handleTouchEnd = (e) => {
      if (touchStartX === null || touchStartY === null) return;
      
      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Sjekk at det er en horisontal swipe (ikke vertikal scroll)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaY) < maxVerticalDistance) {
        // Swipe venstre (neste steg)
        if (deltaX < -minSwipeDistance && !nextButton.disabled && callbacks.onNextStep) {
          e.preventDefault();
          playNavigationSound('next');
          callbacks.onNextStep();
        }
        // Swipe høyre (forrige steg)
        else if (deltaX > minSwipeDistance && !prevButton.disabled && callbacks.onPrevStep) {
          e.preventDefault();
          playNavigationSound('prev');
          callbacks.onPrevStep();
        }
      }
      
      // Reset
      touchStartX = null;
      touchStartY = null;
    };
    
    // Legg til touch event listeners på image container
    imageContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    imageContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Lagre cleanup-funksjon på containeren for å fjerne listeners når view fjernes
    container._keyboardCleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      imageContainer.removeEventListener('touchstart', handleTouchStart);
      imageContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }
  
  return container;
}

/**
 * Viser belønning ved fullført prosjekt
 * @param {HTMLElement} container - Container-elementet å legge belønningen i
 */
export function showCelebration(container) {
  // Fjern eksisterende belønning hvis den finnes
  const existing = container.querySelector('.viewer__celebration');
  if (existing) {
    existing.remove();
  }
  
  const celebration = document.createElement('div');
  celebration.className = 'viewer__celebration';
  
  // Lag konfetti-partikler
  const emojis = ['🎉', '⭐', '🎊', '✨', '🏆'];
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'viewer__celebration-particle';
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 0.5}s`;
    celebration.appendChild(particle);
  }
  
  container.appendChild(celebration);
  
  // Fjern belønning etter animasjon
  setTimeout(() => {
    celebration.remove();
  }, 2500);
}
