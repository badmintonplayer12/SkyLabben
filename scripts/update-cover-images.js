/**
 * Script for å oppdatere/generere cover-bilder for alle prosjekter
 * 
 * Dette scriptet:
 * 1. Scanner alle prosjekter i /projects/
 * 2. For hvert prosjekt:
 *    - Sjekker om cover.png eksisterer
 *    - Hvis ikke, kopierer siste bilde (sortert etter nummer) til cover.png
 *    - Hvis cover.png allerede eksisterer, hoppes den over (ikke overskrevet)
 *    - Med --force: Overskriv også eksisterende cover.png filer
 * 
 * Bruk: 
 *   node scripts/update-cover-images.js              # Oppdater kun manglende cover-bilder
 *   node scripts/update-cover-images.js --force     # Oppdater alle cover-bilder (overskriv eksisterende)
 *   node scripts/update-cover-images.js --dry-run    # Vis hva som ville blitt gjort uten å gjøre det
 */

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

/**
 * Leser alle bilder i en mappe og sorterer dem
 * @param {string} dirPath - Sti til mappen
 * @returns {string[]} Sortert liste over bilder
 */
function getImageFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  
  const files = fs.readdirSync(dirPath);
  return files
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
    .filter(file => file !== 'cover.png') // Exkluder cover.png fra steps
    .sort((a, b) => {
      // Sorter etter nummer i starten av filnavnet
      const numA = parseInt(a.match(/^(\d+)/)?.[1] || '999999');
      const numB = parseInt(b.match(/^(\d+)/)?.[1] || '999999');
      return numA - numB;
    });
}

/**
 * Finner siste bilde som kan brukes som cover
 * @param {string} dirPath - Sti til prosjektmappen
 * @returns {string|null} Filnavn på siste bilde, eller null hvis ingen finnes
 */
function findLastImage(dirPath) {
  const images = getImageFiles(dirPath);
  if (images.length === 0) return null;
  
  // Returner siste bilde (sortert etter nummer)
  return images[images.length - 1];
}

/**
 * Oppdaterer cover-bilde for et prosjekt
 * @param {string} projectPath - Sti til prosjektmappen
 * @param {boolean} force - Hvis true, overskriv eksisterende cover.png
 * @param {boolean} dryRun - Hvis true, gjør ingenting, bare vis hva som ville blitt gjort
 * @returns {Object} Resultat-objekt med status
 */
function updateCoverImage(projectPath, force = false, dryRun = false) {
  const coverPath = path.join(projectPath, 'cover.png');
  const coverExists = fs.existsSync(coverPath);
  
  // Hvis cover.png eksisterer, hopp over (ikke overskriv eksisterende)
  // Med --force kan eksisterende filer overskrives
  if (coverExists && !force) {
    return { 
      status: 'skipped', 
      reason: 'cover.png eksisterer allerede (ikke overskrevet)',
      project: path.basename(projectPath)
    };
  }
  
  // Finn siste bilde
  const lastImage = findLastImage(projectPath);
  if (!lastImage) {
    return { 
      status: 'error', 
      reason: 'ingen bilder funnet',
      project: path.basename(projectPath)
    };
  }
  
  const sourcePath = path.join(projectPath, lastImage);
  
  if (dryRun) {
    return { 
      status: 'would_update', 
      source: lastImage,
      project: path.basename(projectPath),
      coverExists
    };
  }
  
  // Kopier siste bilde til cover.png
  try {
    fs.copyFileSync(sourcePath, coverPath);
    return { 
      status: 'updated', 
      source: lastImage,
      project: path.basename(projectPath),
      wasExisting: coverExists
    };
  } catch (error) {
    return { 
      status: 'error', 
      reason: error.message,
      project: path.basename(projectPath)
    };
  }
}

/**
 * Rekursivt scanner alle prosjekter og oppdaterer cover-bilder
 * @param {string} dirPath - Sti til mappen å scanne
 * @param {boolean} force - Hvis true, overskriv eksisterende cover.png
 * @param {boolean} dryRun - Hvis true, gjør ingenting, bare vis hva som ville blitt gjort
 * @returns {Object[]} Liste over resultater
 */
function scanAndUpdate(dirPath, force = false, dryRun = false) {
  const results = [];
  
  if (!fs.existsSync(dirPath)) {
    console.error(`Mappen finnes ikke: ${dirPath}`);
    return results;
  }
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Sjekk om dette er et prosjekt (har meta.json)
      const metaPath = path.join(fullPath, 'meta.json');
      if (fs.existsSync(metaPath)) {
        // Dette er et prosjekt - oppdater cover
        const result = updateCoverImage(fullPath, force, dryRun);
        results.push(result);
      }
      
      // Rekursivt scan children (underprosjekter)
      const childResults = scanAndUpdate(fullPath, force, dryRun);
      results.push(...childResults);
    }
  }
  
  return results;
}

/**
 * Hovedfunksjon
 */
function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dryRun = args.includes('--dry-run');
  
  console.log('Oppdaterer cover-bilder for alle prosjekter...\n');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - Ingen endringer vil bli gjort\n');
  }
  
  if (force) {
    console.log('⚠️  FORCE MODE - Eksisterende cover.png vil bli overskrevet\n');
  }
  
  const results = scanAndUpdate(PROJECTS_DIR, force, dryRun);
  
  // Oppsummering
  const updated = results.filter(r => r.status === 'updated').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const wouldUpdate = results.filter(r => r.status === 'would_update').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log('\n=== Oppsummering ===');
  if (dryRun) {
    console.log(`Ville oppdatere: ${wouldUpdate}`);
    console.log(`Ville hoppe over: ${skipped}`);
  } else {
    console.log(`Oppdatert: ${updated}`);
    console.log(`Hoppet over: ${skipped}`);
  }
  console.log(`Feil: ${errors}\n`);
  
  // Vis detaljer
  if (dryRun) {
    const wouldUpdateList = results.filter(r => r.status === 'would_update');
    if (wouldUpdateList.length > 0) {
      console.log('Ville oppdatere:');
      wouldUpdateList.forEach(r => {
        console.log(`  - ${r.project}: ${r.source} → cover.png ${r.coverExists ? '(overskriver eksisterende)' : '(ny)'}`);
      });
      console.log();
    }
  } else {
    const updatedList = results.filter(r => r.status === 'updated');
    if (updatedList.length > 0) {
      console.log('Oppdatert:');
      updatedList.forEach(r => {
        console.log(`  - ${r.project}: ${r.source} → cover.png ${r.wasExisting ? '(overskrev eksisterende)' : '(ny)'}`);
      });
      console.log();
    }
  }
  
  const errorList = results.filter(r => r.status === 'error');
  if (errorList.length > 0) {
    console.log('Feil:');
    errorList.forEach(r => {
      console.log(`  - ${r.project}: ${r.reason}`);
    });
    console.log();
  }
  
  if (!dryRun && updated > 0) {
    console.log('✅ Cover-bilder oppdatert!');
  } else if (dryRun && wouldUpdate > 0) {
    console.log('💡 Kjør uten --dry-run for å oppdatere cover-bilder');
  } else {
    console.log('✅ Alle prosjekter har allerede cover.png');
  }
}

// Kjør hvis dette er hovedmodulen
if (require.main === module) {
  main();
}

module.exports = { updateCoverImage, scanAndUpdate };

