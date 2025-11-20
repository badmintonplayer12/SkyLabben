/**
 * Onboarding/hjelp for barn
 * 
 * Viser en kort visuell onboarding første gang appen åpnes.
 */

const STORAGE_KEY = 'legoInstructions.onboardingShown';

/**
 * Sjekker om onboarding allerede er vist
 * @returns {boolean} true hvis onboarding er vist, false ellers
 */
export function hasSeenOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (e) {
    console.error('Kunne ikke lese onboarding-status fra localStorage:', e);
    return false;
  }
}

/**
 * Markerer onboarding som vist
 */
export function markOnboardingAsSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch (e) {
    console.error('Kunne ikke lagre onboarding-status til localStorage:', e);
  }
}

/**
 * Viser et generisk overlay med ikon, tekstlinjer og handlingsknapper.
 * Gjenbruker eksisterende onboarding-stiler for konsistent utseende.
 * @param {HTMLElement} container - Container-elementet å legge overlay i
 * @param {Object} options - Konfigurasjon
 * @param {string} [options.icon] - Ikon/emoji
 * @param {string[]} [options.lines] - Tekstlinjer som vises i overlay
 * @param {string} [options.primaryLabel] - Tekst for primærknapp
 * @param {function(): void} [options.onPrimary] - Callback for primærknapp
 * @param {string} [options.secondaryLabel] - Tekst for sekundærknapp (valgfritt)
 * @param {function(): void} [options.onSecondary] - Callback for sekundærknapp (valgfritt)
 * @param {boolean} [options.allowBackdropDismiss=true] - Om klikk på bakgrunn lukker overlay
 * @param {function(): void} [options.onDismiss] - Callback ved lukking (uansett årsak)
 * @returns {{remove: function(): void}} - Hjelper for å fjerne overlay
 */
export function showOverlayMessage(container, {
  icon = 'ℹ️',
  lines = [],
  primaryLabel = 'OK',
  onPrimary,
  secondaryLabel,
  onSecondary,
  allowBackdropDismiss = true,
  onDismiss
} = {}) {
  const existing = container.querySelector('.onboarding-overlay');
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';

  const content = document.createElement('div');
  content.className = 'onboarding-overlay__content';

  const mascot = document.createElement('div');
  mascot.className = 'onboarding-overlay__mascot';
  mascot.textContent = icon || '';

  const instructions = document.createElement('div');
  instructions.className = 'onboarding-overlay__instructions';

  lines.forEach((line) => {
    const instruction = document.createElement('div');
    instruction.className = 'onboarding-overlay__instruction';
    instruction.textContent = line;
    instructions.appendChild(instruction);
  });

  const actions = document.createElement('div');
  actions.className = 'onboarding-overlay__actions';

  const primaryButton = document.createElement('button');
  primaryButton.className = 'onboarding-overlay__dismiss';
  primaryButton.type = 'button';
  primaryButton.textContent = primaryLabel || 'OK';
  primaryButton.addEventListener('click', () => {
    if (typeof onPrimary === 'function') {
      onPrimary();
    }
    overlay.remove();
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  });
  actions.appendChild(primaryButton);

  if (secondaryLabel) {
    const secondaryButton = document.createElement('button');
    secondaryButton.className = 'onboarding-overlay__secondary';
    secondaryButton.type = 'button';
    secondaryButton.textContent = secondaryLabel;
    secondaryButton.addEventListener('click', () => {
      if (typeof onSecondary === 'function') {
        onSecondary();
      }
      overlay.remove();
      if (typeof onDismiss === 'function') {
        onDismiss();
      }
    });
    actions.appendChild(secondaryButton);
  }

  if (allowBackdropDismiss) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        if (typeof onDismiss === 'function') {
          onDismiss();
        }
      }
    });
  }

  content.appendChild(mascot);
  content.appendChild(instructions);
  content.appendChild(actions);
  overlay.appendChild(content);
  container.appendChild(overlay);

  return {
    remove: () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }
  };
}

/**
 * Viser onboarding-overlay
 * @param {HTMLElement} container - Container-elementet å legge overlay i
 * @param {function(): void} onDismiss - Callback når onboarding avsluttes
 */
export function showOnboarding(container, onDismiss) {
  showOverlayMessage(container, {
    icon: '🧱',
    lines: [
      'Trykk på pilene for å bla',
      'Trykk på huset for å gå tilbake'
    ],
    primaryLabel: 'Start!',
    onPrimary: () => markOnboardingAsSeen(),
    allowBackdropDismiss: true,
    onDismiss: () => {
      markOnboardingAsSeen();
      if (typeof onDismiss === 'function') {
        onDismiss();
      }
    }
  });
}

