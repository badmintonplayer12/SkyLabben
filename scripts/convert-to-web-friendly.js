/**
 * Script for å konvertere prosjektmapper til web-vennlig format
 * 
 * Dette scriptet:
 * 1. Scanner alle mapper i /projects/
 * 2. Lagrer originale navn (for name-feltet i JSON)
 * 3. Konverterer til web-vennlige navn
 * 4. Genererer/oppdaterer meta.json filer
 * 5. Oppdaterer projects.json
 * 6. Omdøper mapper (med bekreftelse)
 * 
 * Bruk: node scripts/convert-to-web-friendly.js [--dry-run] [--confirm]
 */

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '..', 'projects');
const PROJECTS_JSON = path.join(__dirname, '..', 'projects.json');

/**
 * Konverterer et navn til web-vennlig format
 * @param {string} name - Originalt navn
 * @returns {string} Web-vennlig navn
 */
function toWebFriendly(name) {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'aa')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-') // Fjern multiple bindestreker
    .replace(/^-|-$/g, ''); // Fjern ledende/trailing bindestreker
}

function readMeta(dirPath) {
  const metaPath = path.join(dirPath, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function compareByLeadingNumber(a, b) {
  const extract = (value) => {
    const match = value.match(/^(\d+)/);
    const num = match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
    return { num, text: value.toLowerCase() };
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
    .filter(file => !/^gallery/i.test(file)) // Exkluder gallery-filer fra steps
    .sort((a, b) => {
      // Sorter basert på nummer i starten av filnavnet
      const numA = parseInt(a.match(/^(\d+)/)?.[1] || '999999');
      const numB = parseInt(b.match(/^(\d+)/)?.[1] || '999999');
      return numA - numB;
    });
}

/**
 * Leser alle gallery-bilder i en mappe
 * @param {string} dirPath - Sti til mappen
 * @returns {string[]} Sortert liste over gallery-bilder
 */
function getGalleryFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  
  const files = fs.readdirSync(dirPath);
  return files
    .filter(file => /^gallery/i.test(file)) // Starter med "gallery" (case-insensitive)
    .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file)) // Bare bildefiler
    .sort(); // Alfabetisk sortering
}

/**
 * Leser children-mapper i en prosjektmappe
 * @param {string} dirPath - Sti til prosjektmappen
 * @returns {Array<{originalName: string, webFriendlyName: string, path: string}>}
 */
function getChildrenDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  return items
    .filter(item => item.isDirectory())
    .map(item => {
      const originalName = item.name;
      const webFriendlyName = toWebFriendly(originalName);
      const childMeta = readMeta(path.join(dirPath, originalName));
      return {
        originalName,
        originalDisplayName: childMeta?.name || originalName,
        webFriendlyName,
        path: webFriendlyName,
        category: childMeta?.category
      };
    })
    .sort((a, b) => compareByLeadingNumber(a.originalName, b.originalName));
}

/**
 * Genererer meta.json for et prosjekt
 * @param {Object} projectInfo - Prosjektinformasjon
 * @returns {Object} meta.json objekt
 */
function generateMetaJson(projectInfo) {
  const { id, name, dirPath, isChild = false, childrenList = null, category } = projectInfo;
  
  const images = getImageFiles(dirPath);
  const galleryFiles = getGalleryFiles(dirPath);
  const children = isChild ? [] : (childrenList || getChildrenDirs(dirPath)).map(child => ({
    id: child.webFriendlyName,
    name: child.originalDisplayName || child.originalName,
    path: child.webFriendlyName
  }));
  
  const meta = {
    id,
    name,
    coverImage: fs.existsSync(path.join(dirPath, 'cover.png')) ? 'cover.png' : undefined,
    steps: images,
    children
  };

  if (category) {
    meta.category = category;
  }

  // Legg til gallery hvis det finnes gallery-filer
  if (galleryFiles.length > 0) {
    meta.gallery = galleryFiles;
  }

  return meta;
}

/**
 * Leser eksisterende meta.json og henter originalt navn
 * @param {string} dirPath - Sti til prosjektmappen
 * @param {string} fallbackName - Fallback navn hvis meta.json ikke finnes
 * @returns {string} Originalt navn
 */
function getOriginalName(dirPath, fallbackName) {
  const meta = readMeta(dirPath);
  return meta?.name || fallbackName;
}

function getCategory(dirPath) {
  const meta = readMeta(dirPath);
  return meta?.category;
}

/**
 * Scanner et prosjekt og returnerer konverteringsinformasjon
 * @param {string} projectDir - Navn på prosjektmappen
 * @returns {Object} Konverteringsinformasjon
 */
function scanProject(projectDir) {
  const originalPath = path.join(PROJECTS_DIR, projectDir);
  if (!fs.existsSync(originalPath) || !fs.statSync(originalPath).isDirectory()) {
    return null;
  }
  
  const webFriendlyName = toWebFriendly(projectDir);
  const needsRename = projectDir !== webFriendlyName;
  
  // Hent originalt navn fra eksisterende meta.json eller bruk mappenavn
  const originalDisplayName = getOriginalName(originalPath, projectDir);
  
  const category = getCategory(originalPath);

  // Scan children
  const children = getChildrenDirs(originalPath).map(child => {
    const childPath = path.join(originalPath, child.originalName);
    const childImages = getImageFiles(childPath);
    const childOriginalName = getOriginalName(childPath, child.originalName);
    const childCategory = getCategory(childPath);
    
    return {
      originalName: child.originalName,
      originalDisplayName: childOriginalName,
      webFriendlyName: child.webFriendlyName,
      needsRename: child.originalName !== child.webFriendlyName,
      path: child.webFriendlyName,
      imageCount: childImages.length,
      category: childCategory
    };
  });
  
  const images = getImageFiles(originalPath);
  
  return {
    originalName: projectDir,
    originalDisplayName,
    webFriendlyName,
    needsRename,
    path: webFriendlyName,
    imageCount: images.length,
    hasCover: fs.existsSync(path.join(originalPath, 'cover.png')),
    children,
    category
  };
}

/**
 * Hovedfunksjon
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const confirm = args.includes('--confirm');
  
  console.log('🔍 Scanner prosjektmapper...\n');
  
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`❌ Mappen ${PROJECTS_DIR} finnes ikke!`);
    process.exit(1);
  }
  
  // Scan alle prosjekter
  const projects = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => scanProject(item.name))
    .filter(p => p !== null);
  
  if (projects.length === 0) {
    console.log('ℹ️  Ingen prosjekter funnet.');
    return;
  }
  
  console.log(`📦 Fant ${projects.length} prosjekt(er):\n`);
  
  // Vis oversikt
  projects.forEach(project => {
    console.log(`📁 ${project.originalDisplayName} (${project.originalName})`);
    if (project.needsRename) {
      console.log(`   → Omdøpes til: ${project.webFriendlyName}`);
    } else {
      console.log(`   ✓ Allerede web-vennlig`);
    }
    console.log(`   Visningsnavn: "${project.originalDisplayName}"`);
    console.log(`   Bilder: ${project.imageCount}`);
    console.log(`   Cover: ${project.hasCover ? '✓' : '✗'}`);
    console.log(`   Underprosjekter: ${project.children.length}`);
    
    if (project.children.length > 0) {
      project.children.forEach(child => {
        console.log(`      - ${child.originalDisplayName} (${child.originalName})`);
        if (child.needsRename) {
          console.log(`        → Omdøpes til: ${child.webFriendlyName}`);
        }
        console.log(`        Visningsnavn: "${child.originalDisplayName}"`);
        console.log(`        Bilder: ${child.imageCount}`);
      });
    }
    console.log('');
  });
  
  // Generer meta.json filer
  console.log('📝 Genererer meta.json filer...\n');
  
  const metaFiles = [];
  const projectsJson = [];
  
  projects.forEach(project => {
    const projectPath = path.join(PROJECTS_DIR, project.originalName);
    
    // Generer meta.json for hovedprosjekt
    const metaJson = generateMetaJson({
      id: project.webFriendlyName,
      name: project.originalDisplayName,
      dirPath: projectPath,
      isChild: false,
      childrenList: project.children,
      category: project.category
    });
    
    const metaPath = path.join(projectPath, 'meta.json');
    metaFiles.push({
      path: metaPath,
      content: metaJson,
      description: `meta.json for ${project.originalDisplayName}`
    });
    
    // Legg til i projects.json
    projectsJson.push({
      id: project.webFriendlyName,
      name: project.originalDisplayName,
      path: project.webFriendlyName,
      category: project.category
    });
    
    // Generer meta.json for children
    project.children.forEach(child => {
      const childPath = path.join(projectPath, child.originalName);
      const childMetaJson = generateMetaJson({
        id: child.webFriendlyName,
        name: child.originalDisplayName,
        dirPath: childPath,
        isChild: true,
        parentPath: project.webFriendlyName,
        category: child.category
      });
      
      const childMetaPath = path.join(childPath, 'meta.json');
      metaFiles.push({
        path: childMetaPath,
        content: childMetaJson,
        description: `meta.json for ${child.originalDisplayName}`
      });
    });
  });
  
  // Vis hva som skal skrives
  console.log('📄 Filer som skal opprettes/oppdateres:\n');
  metaFiles.forEach(file => {
    console.log(`   ${file.path}`);
    console.log(`   ${file.description}`);
  });
  
  console.log(`\n📋 projects.json vil inneholde ${projectsJson.length} prosjekt(er)\n`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN - Ingen endringer gjort\n');
    console.log('JSON-innhold som ville blitt skrevet:');
    console.log(JSON.stringify(projectsJson, null, 2));
    return;
  }
  
  // Skriv meta.json filer
  console.log('💾 Skriver meta.json filer...\n');
  metaFiles.forEach(file => {
    try {
      fs.writeFileSync(file.path, JSON.stringify(file.content, null, 2) + '\n', 'utf8');
      console.log(`   ✓ ${file.path}`);
    } catch (error) {
      console.error(`   ❌ Feil ved skriving av ${file.path}:`, error.message);
    }
  });
  
  // Skriv projects.json
  console.log('\n💾 Skriver projects.json...\n');
  try {
    fs.writeFileSync(PROJECTS_JSON, JSON.stringify(projectsJson, null, 2) + '\n', 'utf8');
    console.log(`   ✓ ${PROJECTS_JSON}`);
  } catch (error) {
    console.error(`   ❌ Feil ved skriving av ${PROJECTS_JSON}:`, error.message);
  }
  
  // Omdøp mapper
  const renameOperations = [];
  
  projects.forEach(project => {
    if (project.needsRename) {
      renameOperations.push({
        from: path.join(PROJECTS_DIR, project.originalName),
        to: path.join(PROJECTS_DIR, project.webFriendlyName),
        description: `${project.originalName} → ${project.webFriendlyName}`
      });
    }
    
    project.children.forEach(child => {
      if (child.needsRename) {
        const parentPath = project.needsRename 
          ? path.join(PROJECTS_DIR, project.webFriendlyName)
          : path.join(PROJECTS_DIR, project.originalName);
        
        renameOperations.push({
          from: path.join(parentPath, child.originalName),
          to: path.join(parentPath, child.webFriendlyName),
          description: `${child.originalName} → ${child.webFriendlyName}`
        });
      }
    });
  });
  
  if (renameOperations.length === 0) {
    console.log('\n✅ Alle mapper er allerede web-vennlige! Ingen omdøping nødvendig.\n');
    return;
  }
  
  console.log(`\n🔄 ${renameOperations.length} mappe(r) må omdøpes:\n`);
  renameOperations.forEach(op => {
    console.log(`   ${op.description}`);
  });
  
  if (!confirm) {
    console.log('\n⚠️  Omdøping av mapper krever bekreftelse.');
    console.log('   Kjør scriptet med --confirm for å omdøpe mapper.');
    console.log('   Eksempel: node scripts/convert-to-web-friendly.js --confirm\n');
    return;
  }
  
  console.log('\n🔄 Omdøper mapper...\n');
  
  // Omdøp i omvendt rekkefølge (children først, så parents)
  // På Windows (case-insensitive) må vi bruke midlertidig navn for å endre case
  renameOperations.reverse().forEach(op => {
    try {
      const targetName = path.basename(op.to);
      const sourceName = path.basename(op.from);
      
      // Sjekk om navnet faktisk er forskjellig (case-sensitive)
      if (sourceName === targetName) {
        console.log(`   ✓ ${op.description} (allerede korrekt)`);
        return;
      }
      
      // På Windows må vi bruke midlertidig navn for case-sensitive omdøping
      // Bruk et unikt midlertidig navn som garantert ikke eksisterer
      const tempName = path.join(path.dirname(op.from), `__temp_rename_${Date.now()}_${Math.random().toString(36).substr(2, 9)}__`);
      
      fs.renameSync(op.from, tempName);
      fs.renameSync(tempName, op.to);
      console.log(`   ✓ ${op.description}`);
    } catch (error) {
      console.error(`   ❌ Feil ved omdøping: ${op.description}`);
      console.error(`      ${error.message}`);
    }
  });
  
  console.log('\n✅ Konvertering fullført!\n');
}

// Kjør scriptet
main();
