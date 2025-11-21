/**
 * QR-kode-generering
 * 
 * Genererer QR-koder for å dele spesifikke steg eller prosjekter.
 * Bruker lokal qrcode.min.js for å unngå nettverksavhengighet.
 */

let qrcodeLibraryLoaded = false;

/**
 * Laster QR-kode-biblioteket fra CDN
 * @returns {Promise<void>}
 */
async function loadQRCodeLibrary() {
  if (qrcodeLibraryLoaded) return;
  
  return new Promise((resolve, reject) => {
    // Sjekk om biblioteket allerede er lastet
    if (window.QRCode) {
      qrcodeLibraryLoaded = true;
      resolve();
      return;
    }
    
    // Last lokal qrcode.js
    const script = document.createElement('script');
    script.src = '/assets/js/qrcode.min.js';
    script.onload = () => {
      qrcodeLibraryLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Kunne ikke laste QR-kode-bibliotek'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Genererer QR-kode for en URL
 * @param {string} url - URL å generere QR-kode for
 * @param {HTMLElement} container - Container-element å legge QR-koden i
 * @param {number} size - Størrelse på QR-koden (default: 256)
 */
export async function generateQRCode(url, container, size = 256) {
  try {
    await loadQRCodeLibrary();
    
    // Fjern eksisterende QR-kode hvis den finnes
    const existing = container.querySelector('.qr-code');
    if (existing) {
      existing.remove();
    }
    
    // Opprett canvas-element for QR-kode
    const canvas = document.createElement('canvas');
    canvas.className = 'qr-code';
    canvas.setAttribute('aria-label', `QR-kode for ${url}`);
    
    // Generer QR-kode
    await QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    container.appendChild(canvas);
  } catch (error) {
    console.error('Kunne ikke generere QR-kode:', error);
    // Vis feilmelding
    const errorMsg = document.createElement('div');
    errorMsg.className = 'qr-code-error';
    errorMsg.textContent = 'Oi! Kunne ikke lage QR-kode – spør en voksen';
    container.appendChild(errorMsg);
  }
}

/**
 * Genererer QR-kode for nåværende steg
 * @param {string} baseUrl - Base URL (f.eks. window.location.origin)
 * @param {string} path - Prosjektpath
 * @param {number} stepIndex - Steg-indeks
 * @param {HTMLElement} container - Container-element å legge QR-koden i
 */
export async function generateQRCodeForStep(baseUrl, path, stepIndex, container) {
  const url = `${baseUrl}/#/p/${path}?step=${stepIndex}`;
  await generateQRCode(url, container);
}

/**
 * Genererer QR-kode for prosjekt (første steg)
 * @param {string} baseUrl - Base URL (f.eks. window.location.origin)
 * @param {string} path - Prosjektpath
 * @param {HTMLElement} container - Container-element å legge QR-koden i
 */
export async function generateQRCodeForProject(baseUrl, path, container) {
  const url = `${baseUrl}/#/p/${path}`;
  await generateQRCode(url, container);
}


