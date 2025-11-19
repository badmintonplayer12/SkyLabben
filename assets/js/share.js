/**
 * Gjenbrukbar delingsfunksjonalitet
 */

/**
 * Deler en URL med Web Share API, clipboard eller prompt som fallback
 * @param {Object} options - Delingsalternativer
 * @param {string} options.url - URL-en som skal deles
 * @param {string} [options.title] - Tittel for delingen
 * @param {string} [options.text] - Tekst for delingen
 * @param {HTMLElement} [options.container] - Container for bekreftelsesmelding (valgfritt)
 * @returns {Promise<void>}
 */
export async function shareUrl({ url, title, text, container = document.body }) {
  try {
    if (navigator.share) {
      // Web Share API (mobil)
      try {
        await navigator.share({
          title: title || 'SkyLabben',
          text: text || 'SkyLabben - LEGO-instruksjonsviser',
          url: url
        });
        return; // Suksess
      } catch (error) {
        if (error?.name === 'AbortError') {
          // Bruker avbrøt - ignorer
          return;
        }
        // Hvis Web Share feiler, prøv clipboard som fallback
        console.warn('Kunne ikke dele med Web Share API:', error);
        throw error; // Fall gjennom til clipboard
      }
    }
    
    // Fallback: kopier lenke til utklippstavlen
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        showSuccessMessage(container);
      } catch (clipboardError) {
        console.warn('Kunne ikke kopiere lenke:', clipboardError);
        alert(`Del denne lenken:\n${url}`);
      }
    } else {
      // Siste fallback: vis URL i prompt
      prompt('Kopier denne lenken:', url);
    }
  } catch (error) {
    // Håndter eventuelle andre feil
    console.warn('Kunne ikke dele:', error);
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        showSuccessMessage(container);
      } catch (clipboardError) {
        prompt('Kopier denne lenken:', url);
      }
    } else {
      prompt('Kopier denne lenken:', url);
    }
  }
}

/**
 * Viser bekreftelsesmelding når lenke er kopiert
 * @param {HTMLElement} container - Container for meldingen
 */
function showSuccessMessage(container) {
  const successMsg = document.createElement('div');
  successMsg.className = 'share-success-message';
  successMsg.textContent = 'Lenke kopiert! 📋';
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
  }, 2000);
}

