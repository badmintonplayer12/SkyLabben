/**
 * Instruksjonsviewer-view
 * 
 * Renderer instruksjonsbilde med navigasjonskontroller.
 */

import { getImageUrl, getAudioUrl, loadProjectMeta } from './data-loader.js';
import { getLastStepFor, resetProgressFor, isInstallPromptAvailable } from './state.js';
import { playNavigationSound, isAudioEnabled, setAudioEnabled } from './audio-feedback.js';
import { generateQRCodeForStep, generateQRCodeForProject } from './qr-code.js';
import { shareUrl } from './share.js';
import { consumePrompt, isStandalone } from './pwa-install.js';
import { getMode, setMode, getOverrides, setOverride, isVisibleForKidsNow, getOverrideKey, createVisibilityToggle } from './visibility.js';
import { showParentQuizDialog } from './parent-quiz.js';
import { openDialog } from './dialog.js';

/**
 * Oppretter en innstillingsmeny for viewer
 * @returns {Object} Meny-objekt med wrapper, addItem, hasItems og cleanup-metoder
 */
function createSettingsMenu() {
  const wrapper = document.createElement('div');
  wrapper.className = 'viewer__settings';
  
  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'viewer__button viewer__button--settings';
  toggleButton.innerHTML = '<span aria-hidden="true">⚙️</span>';
  toggleButton.setAttribute('aria-label', 'Vis flere innstillinger');
  toggleButton.title = 'Flere innstillinger';
  toggleButton.disabled = true;
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-haspopup', 'true');
  
  const menu = document.createElement('div');
  menu.className = 'viewer__settings-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-hidden', 'true');
  
  wrapper.appendChild(toggleButton);
  wrapper.appendChild(menu);
  
  const menuItems = [];
  let isOpen = false;
  
  const closeMenu = () => {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    wrapper.classList.remove('viewer__settings--open');
    toggleButton.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.removeEventListener('pointerdown', handleOutsidePointer);
    document.removeEventListener('keydown', handleEscape);
  };
  
  const openMenu = () => {
    if (isOpen || menuItems.length === 0) {
      return;
    }
    isOpen = true;
    wrapper.classList.add('viewer__settings--open');
    toggleButton.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', handleEscape);
  };
  
  const handleOutsidePointer = (event) => {
    if (!wrapper.contains(event.target)) {
      closeMenu();
    }
  };
  
  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      toggleButton.focus();
    }
  };
  
  const handleToggle = (event) => {
    event.preventDefault();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };
  
  toggleButton.addEventListener('click', handleToggle);
  
  return {
    wrapper,
    hasItems: () => menuItems.length > 0,
    addItem: ({ icon, label, onClick, getIcon, getLabel }) => {
      if (typeof onClick !== 'function') {
        throw new Error('settingsMenu.addItem krever en onClick-funksjon');
      }
      
      const itemButton = document.createElement('button');
      itemButton.type = 'button';
      itemButton.className = 'viewer__settings-item';
      itemButton.setAttribute('role', 'menuitem');
      
      const iconElement = document.createElement('span');
      iconElement.className = 'viewer__settings-item-icon';
      
      const labelElement = document.createElement('span');
      labelElement.className = 'viewer__settings-item-label';
      
      itemButton.appendChild(iconElement);
      itemButton.appendChild(labelElement);
      
      const applyContent = () => {
        const resolvedIcon = typeof getIcon === 'function' ? getIcon() : icon;
        const resolvedLabel = typeof getLabel === 'function' ? getLabel() : label;
        iconElement.textContent = resolvedIcon || '';
        labelElement.textContent = resolvedLabel || '';
      };
      
      applyContent();
      
      itemButton.addEventListener('click', () => {
        onClick();
        closeMenu();
      });
      
      menu.appendChild(itemButton);
      menuItems.push({ refresh: applyContent, element: itemButton });
      toggleButton.disabled = false;
      
      return {
        refresh: () => applyContent()
      };
    },
    cleanup: () => {
      closeMenu();
      toggleButton.removeEventListener('click', handleToggle);
    }
  };
}

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
  const currentMode = getMode();
  let overrides = getOverrides();
  const isParentMode = currentMode === 'parent';
  const settingsMenu = createSettingsMenu();
  const parentOverrideKey = getOverrideKey({ projectId: state.currentProjectMeta?.id || state.currentPath });
  const defaultParentVisible = state.currentProjectMeta?.approvedByDefault !== false;
  let projectToggleController = null;
  const childTileControllers = [];

  const isVisibleEffective = (projectId, childId, defaultVisible) => {
    return isVisibleForKidsNow(
      {
        id: projectId,
        childId,
        approvedByDefault: defaultVisible
      },
      overrides
    );
  };

  const applyChildVisibility = () => {
    const parentVisible = isVisibleEffective(state.currentProjectMeta?.id || state.currentPath, null, defaultParentVisible);
    if (projectToggleController) {
      projectToggleController.setChecked(parentVisible);
    }
    childTileControllers.forEach(({ tile, toggle, key, defaultVisible }) => {
      const childVisible = isVisibleEffective(state.currentProjectMeta?.id || state.currentPath, key.childId, defaultVisible);
      const effectiveVisible = parentVisible && childVisible;
      toggle.setDisabled(!parentVisible);
      toggle.setChecked(parentVisible ? childVisible : false);
      if (effectiveVisible) {
        tile.classList.remove('project-tile--hidden-for-kids');
        const badge = tile.querySelector('.project-hidden-overlay');
        if (badge) badge.classList.remove('visible');
        const img = tile.querySelector('img');
        if (img) img.classList.remove('dimmed');
      } else {
        tile.classList.add('project-tile--hidden-for-kids');
        const badge = tile.querySelector('.project-hidden-overlay');
        if (badge) badge.classList.add('visible');
        const img = tile.querySelector('img');
        if (img) img.classList.add('dimmed');
      }
    });
  };
  const resolveChecked = (key, defaultVisible) => {
    const overrideValue = key ? overrides[key] : undefined;
    return overrideValue === undefined ? defaultVisible : overrideValue === 'visible';
  };
  
  // Header
  const header = document.createElement('div');
  header.className = 'viewer__header app-header';
  header.textContent = state.currentProjectMeta?.name || '';
  const headerActions = document.createElement('div');
  headerActions.className = 'viewer__header-actions';
  if (isParentMode) {
    const modeBadge = document.createElement('span');
    modeBadge.className = 'mode-indicator';
    modeBadge.textContent = 'Foreldremodus aktiv';
    header.appendChild(modeBadge);

    if (parentOverrideKey) {
      const { element: projectToggle, setDisabled, setChecked } = createVisibilityToggle({
        checked: resolveChecked(parentOverrideKey, defaultParentVisible),
        onChange: (checked) => {
          overrides = setOverride(parentOverrideKey, checked ? 'visible' : 'hidden');
          applyChildVisibility();
        }
      });
      projectToggle.style.marginLeft = 'var(--spacing-sm)';
      header.appendChild(projectToggle);
      projectToggleController = { setDisabled, setChecked };
    }
  }
  header.appendChild(headerActions);
  
  // Image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'viewer__main';
  
  // Håndter tom steps-array
  const steps = state.currentProjectMeta?.steps || [];
  const children = state.currentProjectMeta?.children || [];
  const parentId = state.currentProjectMeta?.id || state.currentPath;
  const visibleChildren = children
    .filter(c => isParentMode ? true : !c.hidden)
    .filter((child) => {
      if (isParentMode) return true;
      return isVisibleForKidsNow(
        {
          id: parentId,
          childId: child.id,
          approvedByDefault: child.approvedByDefault,
          releaseAt: child.releaseAt
        },
        overrides
      );
    })
    .sort((a, b) => compareByLeadingNumber(a.name || a.id, b.name || b.id));
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      return;
    }
    const target = document.documentElement || document.body || container;
    if (target?.requestFullscreen) {
      target.requestFullscreen().catch(() => {});
    }
  };
  const openQrModal = async () => {
    const qrContainer = document.createElement('div');
    qrContainer.className = 'qr-modal__container';
    
    const baseUrl = window.location.origin;
    
    // Hvis prosjektet har steg, generer QR-kode for nåværende steg
    // Hvis ikke, generer QR-kode for prosjektet (første steg/oversikt)
    if (steps.length > 0) {
      await generateQRCodeForStep(baseUrl, state.currentPath, state.currentStepIndex, qrContainer);
    } else {
      await generateQRCodeForProject(baseUrl, state.currentPath, qrContainer);
    }

    openDialog({
      title: 'QR-kode',
      content: qrContainer,
      size: 'sm',
      actions: [
        { label: 'Lukk', variant: 'secondary' }
      ]
    });
  };
  
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

  const handleModeToggle = () => {
    if (isParentMode) {
      setMode('child');
      window.location.reload();
      return;
    }
    showParentQuizDialog({
      onSuccess: () => {
        window.location.reload();
      }
    });
  };

  settingsMenu.addItem({
    getIcon: () => (isParentMode ? '👶' : '🔒'),
    getLabel: () => (isParentMode ? 'Til barnemodus' : 'Foreldremodus'),
    onClick: handleModeToggle
  });
  
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
      childrenGrid.className = 'project-grid project-grid--inline';
      
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

        if (isParentMode) {
          const childKey = getOverrideKey({
            projectId: parentId,
            childId: child.id || child.path
          });
          const childDefaultVisible = child.approvedByDefault !== false;
          const { element: toggleEl, setDisabled, setChecked } = createVisibilityToggle({
            checked: resolveChecked(childKey, childDefaultVisible),
            disabled: false,
            onChange: (checked) => {
              overrides = setOverride(childKey, checked ? 'visible' : 'hidden');
              applyChildVisibility();
            }
          });
          toggleEl.addEventListener('click', (event) => event.stopPropagation());
          const togglePos = document.createElement('div');
          togglePos.className = 'toggle-overlay-position';
          togglePos.appendChild(toggleEl);
          tile.appendChild(togglePos);

          const hiddenOverlay = document.createElement('div');
          hiddenOverlay.className = 'project-hidden-overlay';
          const badge = document.createElement('div');
          badge.className = 'project-hidden-badge';
          badge.innerHTML = '<span aria-hidden="true">🚫</span><span>Skjult for barn</span>';
          hiddenOverlay.appendChild(badge);
          tile.appendChild(hiddenOverlay);

          childTileControllers.push({
            tile,
            toggle: { setDisabled, setChecked },
            key: { childId: child.id || child.path },
            defaultVisible: childDefaultVisible
          });
        }
        
        tile.addEventListener('click', () => {
          if (callbacks.onProjectClick) {
            callbacks.onProjectClick(`${state.currentPath}/${child.path}`);
          }
        });
        
        childrenGrid.appendChild(tile);
      });
      
      imageContainer.appendChild(childrenGrid);
      if (isParentMode) {
        applyChildVisibility();
      }
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
  
  let audioMenuItem = null;
  if (steps.length > 0) {
    audioMenuItem = settingsMenu.addItem({
      getIcon: () => (isAudioEnabled() ? '🔊' : '🔇'),
      getLabel: () => (isAudioEnabled() ? 'Skru av lyd' : 'Skru på lyd'),
      onClick: () => {
        const newState = !isAudioEnabled();
        setAudioEnabled(newState);
        audioMenuItem.refresh();
      }
    });
  }
  
  // Audio-knapp for steg-vis lydhint (hvis audioSteps finnes)
  const audioSteps = state.currentProjectMeta?.audioSteps || [];
  let currentAudio = null; // Lagre referanse til nåværende audio for å kunne stoppe den
  if (steps.length > 0 && audioSteps.length > 0 && state.currentStepIndex < audioSteps.length) {
    const audioStep = audioSteps[state.currentStepIndex];
    if (audioStep) {
      const audioButton = document.createElement('button');
      audioButton.className = 'viewer__button viewer__button--audio-step';
      audioButton.innerHTML = '<span class="viewer__icon" aria-hidden="true">🎵</span>';
      audioButton.setAttribute('aria-label', 'Spill av lydhint for dette steg');
      audioButton.title = 'Spill av lydhint';
      audioButton.addEventListener('click', () => {
        // Stopp forrige audio hvis den spiller
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio = null;
        }
        
        currentAudio = new Audio(getAudioUrl(state.currentPath, audioStep));
        
        // Rydd opp når audio er ferdig
        currentAudio.addEventListener('ended', () => {
          currentAudio = null;
        });
        
        currentAudio.play().catch((error) => {
          console.warn('Kunne ikke spille lyd:', error);
          currentAudio = null;
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
  
  // Legg til QR-kode-knapp for både prosjekter med steg og hovedprosjekter
  settingsMenu.addItem({
    icon: '📱',
    label: 'Vis QR-kode',
    onClick: () => {
      openQrModal();
    }
  });
  
  if (steps.length > 0) {
    settingsMenu.addItem({
      icon: '🔄',
      label: 'Nullstill progresjon',
      onClick: () => {
        if (confirm('Vil du nullstille progresjonen for dette prosjektet?')) {
          resetProgressFor(state.currentPath);
          if (callbacks.onStepChange) {
            callbacks.onStepChange(0);
          }
        }
      }
    });
  }
  
  // Install app-knapp (kun hvis install prompt er tilgjengelig og ikke allerede installert)
  if (isInstallPromptAvailable() && !isStandalone()) {
    const installItem = settingsMenu.addItem({
      icon: '⬇️',
      label: 'Installer app',
      onClick: async () => {
        try {
          const result = await consumePrompt();
          if (result.outcome === 'accepted') {
            // Appen ble installert - vis en liten feiring eller melding
            const successMsg = document.createElement('div');
            successMsg.className = 'viewer__empty-message';
            successMsg.textContent = 'Appen er installert! 🎉';
            successMsg.style.position = 'fixed';
            successMsg.style.top = '50%';
            successMsg.style.left = '50%';
            successMsg.style.transform = 'translate(-50%, -50%)';
            successMsg.style.zIndex = '1001';
            successMsg.style.background = 'var(--color-background)';
            successMsg.style.padding = 'var(--spacing-lg)';
            successMsg.style.borderRadius = 'var(--border-radius)';
            successMsg.style.boxShadow = 'var(--shadow)';
            container.appendChild(successMsg);
            setTimeout(() => {
              successMsg.remove();
            }, 3000);
          }
          // Hvis brukeren avviste, vil beforeinstallprompt kunne fyre igjen senere
          // Men knappen vil ikke vises før neste gang prompten blir tilgjengelig
        } catch (error) {
          console.warn('Kunne ikke vise install prompt:', error);
        }
      }
    });
  }

  const fullscreenItem = settingsMenu.addItem({
    getIcon: () => (document.fullscreenElement ? '🡼' : '⛶'),
    getLabel: () => (document.fullscreenElement ? 'Avslutt fullskjerm' : 'Fullskjerm'),
    onClick: () => {
      toggleFullscreen();
    }
  });
  const fullscreenHandlerKey = '__viewerFullscreenChange';
  if (document[fullscreenHandlerKey]) {
    document.removeEventListener('fullscreenchange', document[fullscreenHandlerKey]);
  }
  const handleFullscreenChange = () => {
    fullscreenItem.refresh();
  };
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document[fullscreenHandlerKey] = handleFullscreenChange;

  // Delingsknapp
  const addShareMenuItem = (label, handler) => {
    settingsMenu.addItem({
      icon: '🔗',
      label,
      onClick: handler
    });
  };

  const buildSharePayload = () => {
    const url = window.location.href;
    const projectName = state.currentProjectMeta?.name || 'SkyLabben';
    const stepNumber = typeof state.currentStepIndex === 'number' ? state.currentStepIndex + 1 : null;
    const shareText = stepNumber ? `${projectName} – Steg ${stepNumber}` : projectName;
    return { url, projectName, shareText };
  };

  if (navigator.share) {
    // Web Share API (mobil)
    addShareMenuItem('Del', async () => {
      const { url, projectName: title, shareText: text } = buildSharePayload();
      await shareUrl({ url, title, text, container });
    });
  } else if (navigator.clipboard) {
    // Fallback: kopier lenke til utklippstavlen
    addShareMenuItem('Kopier lenke', async () => {
      const { url } = buildSharePayload();
      await shareUrl({ url, container });
    });
  } else {
    // Siste fallback: vis URL i prompt
    addShareMenuItem('Del lenke', () => {
      const { url } = buildSharePayload();
      shareUrl({ url });
    });
  }
  
  bottomBar.appendChild(upButton);
  bottomBar.appendChild(prevButton);
  bottomBar.appendChild(progressBar);
  bottomBar.appendChild(nextButton);
  bottomBar.appendChild(stepIndicator);
  if (settingsMenu.hasItems()) {
    headerActions.appendChild(settingsMenu.wrapper);
  } else {
    settingsMenu.cleanup();
  }
  
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

function compareByLeadingNumber(a, b) {
  const extract = (value) => {
    if (!value) {
      return { num: Number.POSITIVE_INFINITY, text: '' };
    }
    const match = value.match(/^(\d+)/);
    const num = match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
    return {
      num,
      text: value.toLowerCase()
    };
  };
  
  const left = extract(a);
  const right = extract(b);
  
  if (left.num !== right.num) {
    return left.num - right.num;
  }
  if (left.text < right.text) return -1;
  if (left.text > right.text) return 1;
  return 0;
}
