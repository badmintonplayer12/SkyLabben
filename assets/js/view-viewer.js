/**
 * Instruksjonsviewer-view
 * 
 * Renderer instruksjonsbilde med navigasjonskontroller.
 */

import { getImageUrl, loadProjectMeta } from './data-loader.js';

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
  
  // Opp-knapp
  const upButton = document.createElement('button');
  upButton.className = 'viewer__button';
  upButton.textContent = 'Opp';
  upButton.addEventListener('click', callbacks.onGoUp);
  
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
  
  // Pil-knapper
  const prevButton = document.createElement('button');
  prevButton.className = 'viewer__button';
  prevButton.textContent = '←';
  prevButton.disabled = steps.length === 0 || state.currentStepIndex === 0;
  if (steps.length > 0 && state.currentStepIndex > 0) {
    prevButton.addEventListener('click', callbacks.onPrevStep);
  }
  
  const nextButton = document.createElement('button');
  nextButton.className = 'viewer__button';
  nextButton.textContent = '→';
  nextButton.disabled = steps.length === 0 || state.currentStepIndex === (steps.length - 1);
  if (steps.length > 0 && state.currentStepIndex < (steps.length - 1)) {
    nextButton.addEventListener('click', callbacks.onNextStep);
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
        
        tile.appendChild(img);
        tile.appendChild(name);
        
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
          callbacks.onNextStep();
        }
        // Swipe høyre (forrige steg)
        else if (deltaX > minSwipeDistance && !prevButton.disabled && callbacks.onPrevStep) {
          e.preventDefault();
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
