/**
 * PWA Install Prompt Handler
 * 
 * Håndterer beforeinstallprompt-eventet og tilbyr en "Installer app"-knapp
 * i settings-menyen når installasjon er tilgjengelig.
 */

let deferredPrompt = null;
let installPromptListeners = [];

/**
 * Initialiserer beforeinstallprompt-lytter
 * @param {function(boolean): void} onAvailabilityChange - Callback som kalles når tilgjengelighet endres
 */
export function initInstallPromptListener(onAvailabilityChange) {
  // Sjekk om appen allerede er installert (standalone-modus)
  if (isStandalone()) {
    if (onAvailabilityChange) {
      onAvailabilityChange(false);
    }
    return;
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    // Forhindre standard browser prompt
    event.preventDefault();
    
    // Lagre event for senere bruk
    deferredPrompt = event;
    
    // Varsle lyttere om at prompt er tilgjengelig
    if (onAvailabilityChange) {
      onAvailabilityChange(true);
    }
    
    // Emit custom event for løsere kobling
    window.dispatchEvent(new CustomEvent('pwa:install-ready', { detail: { available: true } }));
  });

  // Lytte etter appinstalled-event (når appen er installert)
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    
    if (onAvailabilityChange) {
      onAvailabilityChange(false);
    }
    
    window.dispatchEvent(new CustomEvent('pwa:installed'));
  });
}

/**
 * Viser installasjonsprompten
 * @returns {Promise<{outcome: string}>} Promise som løser til userChoice-resultatet
 */
export async function consumePrompt() {
  if (!deferredPrompt) {
    throw new Error('Install prompt er ikke tilgjengelig');
  }

  try {
    // Vis prompten
    deferredPrompt.prompt();
    
    // Vent på brukerens valg
    const { outcome } = await deferredPrompt.userChoice;
    
    // Nullstill deferredPrompt etter bruk
    deferredPrompt = null;
    
    return { outcome };
  } catch (error) {
    console.warn('Kunne ikke vise install prompt:', error);
    deferredPrompt = null;
    throw error;
  }
}

/**
 * Sjekker om install-prompt er tilgjengelig
 * @returns {boolean} true hvis prompt er tilgjengelig
 */
export function isInstallAvailable() {
  return deferredPrompt !== null && !isStandalone();
}

/**
 * Sjekker om appen kjører i standalone-modus (allerede installert)
 * @returns {boolean} true hvis appen er installert
 */
export function isStandalone() {
  // Sjekk display-mode media query
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Fallback: sjekk navigator.standalone (iOS Safari)
  if (window.navigator.standalone === true) {
    return true;
  }
  
  return false;
}

