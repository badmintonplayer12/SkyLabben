/**
 * Prosjektgalleri-view
 * 
 * Renderer grid/liste over prosjekter med cover-bilder og navn.
 */

import { getImageUrl, loadProjectMeta } from './data-loader.js';
import { getLastStepFor } from './state.js';

/**
 * Renderer prosjektgalleri
 * @param {Array<{id: string, name: string, path: string, hidden?: boolean}>} projects - Liste over prosjekter
 * @param {function(string): void} onProjectClick - Callback når prosjekt klikkes (tar path)
 * @returns {HTMLElement} Container-element med galleri
 * 
 * Viktig: View gjør IKKE direkte state/URL-oppdateringer. Den kaller onProjectClick callback
 * som sendes fra main.js, og main.js håndterer state/URL-oppdateringer.
 */
export function renderProjectGrid(projects, onProjectClick) {
  const container = document.createElement('div');
  container.className = 'project-grid';
  
  // Filtrer bort skjulte prosjekter
  const visibleProjects = projects.filter(project => !project.hidden);
  
  visibleProjects.forEach(project => {
    const tile = document.createElement('div');
    tile.className = 'project-tile';
    tile.setAttribute('data-path', project.path);
    
    // Cover-bilde
    const img = document.createElement('img');
    img.className = 'project-tile__image';
    img.src = getImageUrl(project.path, 'cover.png');
    img.alt = project.name;
    img.onerror = async () => {
      // Fallback til siste bilde hvis cover.png ikke finnes
      try {
        const meta = await loadProjectMeta(project.path);
        const steps = meta.steps || [];
        if (steps.length > 0) {
          // Bruk siste bilde i steps-arrayet
          const lastStep = steps[steps.length - 1];
          img.src = getImageUrl(project.path, lastStep);
        } else {
          // Hvis ingen steps, prøv å skjule bildet
          img.style.display = 'none';
        }
      } catch (error) {
        // Hvis vi ikke kan laste meta.json, skjul bildet
        console.warn(`Kunne ikke laste meta.json for ${project.path}, skjuler cover-bilde`);
        img.style.display = 'none';
      }
    };
    
    // Navn
    const name = document.createElement('div');
    name.className = 'project-tile__name';
    name.textContent = project.name;
    
    // Progresjonsindikator (lastes asynkront)
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'project-tile__progress';
    
    // Last meta for å få totalt antall steg og vis progresjon
    loadProjectMeta(project.path).then(meta => {
      const steps = meta.steps || [];
      const totalSteps = steps.length;
      const lastStep = getLastStepFor(project.path);
      
      if (totalSteps > 0 && lastStep > 0) {
        const progressPercent = ((lastStep + 1) / totalSteps) * 100;
        progressIndicator.style.width = `${progressPercent}%`;
        progressIndicator.setAttribute('aria-label', `${lastStep + 1}/${totalSteps} steg`);
        progressIndicator.classList.add('project-tile__progress--visible');
      } else {
        progressIndicator.style.display = 'none';
      }
    }).catch(() => {
      // Hvis meta ikke kan lastes, skjul progresjonsindikator
      progressIndicator.style.display = 'none';
    });
    
    tile.appendChild(img);
    tile.appendChild(name);
    tile.appendChild(progressIndicator);
    
    // Event listener
    tile.addEventListener('click', () => {
      onProjectClick(project.path);
    });
    
    container.appendChild(tile);
  });
  
  return container;
}
