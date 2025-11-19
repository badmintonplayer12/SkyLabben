/**
 * Audio feedback og haptikk
 * 
 * Håndterer lyd og haptisk feedback for navigasjon.
 */

const STORAGE_KEY = 'legoInstructions.audioEnabled';

// Singleton AudioContext - gjenbrukes for alle lydspillinger
let audioContext = null;

/**
 * Henter eller oppretter AudioContext
 * @returns {AudioContext|null} AudioContext eller null hvis ikke støttet
 */
function getAudioContext() {
  // Opprett AudioContext kun én gang
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Kunne ikke opprette AudioContext:', e);
      return null;
    }
  }
  
  // Viktig for mobile enheter: Resume AudioContext hvis den er suspended
  // Dette skjer ofte på iOS/Android når siden ikke er aktiv
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(e => {
      console.warn('Kunne ikke resume AudioContext:', e);
    });
  }
  
  return audioContext;
}

/**
 * Sjekker om lyd er aktivert
 * @returns {boolean} true hvis lyd er aktivert, false ellers
 */
export function isAudioEnabled() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== 'false'; // Default til true hvis ikke satt
  } catch (e) {
    console.error('Kunne ikke lese audio-innstilling fra localStorage:', e);
    return true;
  }
}

/**
 * Setter audio-innstilling
 * @param {boolean} enabled - true for å aktivere, false for å deaktivere
 */
export function setAudioEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled.toString());
  } catch (e) {
    console.error('Kunne ikke lagre audio-innstilling til localStorage:', e);
  }
}

/**
 * Spiller en kort klikk-lyd
 */
export function playClickSound() {
  if (!isAudioEnabled()) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    // Bruk eksisterende AudioContext for å generere en kort klikk-lyd
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800; // Høy tone for klikk
    oscillator.type = 'sine';
    
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } catch (e) {
    // Fallback hvis Web Audio API ikke støttes eller feiler
    console.warn('Kunne ikke spille klikk-lyd:', e);
  }
}

/**
 * Trigger haptisk feedback hvis støttet
 * @param {string} type - Type feedback ('light', 'medium', 'heavy')
 */
export function triggerHapticFeedback(type = 'light') {
  if (!isAudioEnabled()) return;
  
  try {
    // Sjekk om Vibration API er støttet
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  } catch (e) {
    // Fallback hvis Vibration API ikke støttes
    console.warn('Kunne ikke trigge haptisk feedback:', e);
  }
}

/**
 * Spiller navigasjonslyd (kombinerer klikk-lyd og haptikk)
 * @param {string} direction - 'next', 'prev', eller 'up'
 */
export function playNavigationSound(direction = 'next') {
  playClickSound();
  triggerHapticFeedback('light');
}

