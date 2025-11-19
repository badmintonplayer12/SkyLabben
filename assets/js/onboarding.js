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
 * Viser onboarding-overlay
 * @param {HTMLElement} container - Container-elementet å legge overlay i
 * @param {function(): void} onDismiss - Callback når onboarding avsluttes
 */
export function showOnboarding(container, onDismiss) {
  // Fjern eksisterende onboarding hvis den finnes
  const existing = container.querySelector('.onboarding-overlay');
  if (existing) {
    existing.remove();
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  
  const content = document.createElement('div');
  content.className = 'onboarding-overlay__content';
  
  // Maskot/ikon (bruker emoji for enkelhet)
  const mascot = document.createElement('div');
  mascot.className = 'onboarding-overlay__mascot';
  mascot.textContent = '🧱';
  
  // Instruksjoner (visuell, minimal tekst)
  const instructions = document.createElement('div');
  instructions.className = 'onboarding-overlay__instructions';
  
  const instruction1 = document.createElement('div');
  instruction1.className = 'onboarding-overlay__instruction';
  instruction1.innerHTML = '<span class="onboarding-overlay__icon">◀️</span><span class="onboarding-overlay__icon">▶️</span> Trykk på pilene for å bla';
  
  const instruction2 = document.createElement('div');
  instruction2.className = 'onboarding-overlay__instruction';
  instruction2.innerHTML = '<span class="onboarding-overlay__icon">🏠</span> Trykk på huset for å gå tilbake';
  
  instructions.appendChild(instruction1);
  instructions.appendChild(instruction2);
  
  // Avbryt-knapp
  const dismissButton = document.createElement('button');
  dismissButton.className = 'onboarding-overlay__dismiss';
  dismissButton.textContent = 'Start!';
  dismissButton.setAttribute('aria-label', 'Start');
  dismissButton.addEventListener('click', () => {
    markOnboardingAsSeen();
    overlay.remove();
    if (onDismiss) {
      onDismiss();
    }
  });
  
  // Klikk utenfor overlay for å avbryte
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      markOnboardingAsSeen();
      overlay.remove();
      if (onDismiss) {
        onDismiss();
      }
    }
  });
  
  content.appendChild(mascot);
  content.appendChild(instructions);
  content.appendChild(dismissButton);
  overlay.appendChild(content);
  
  container.appendChild(overlay);
}

