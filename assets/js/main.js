/**
 * Hovedkoordinator for LEGO Instruksjonsvisning-applikasjonen
 * 
 * Dette er applikasjonens entry point som koordinerer routing, state og views.
 */

import { init as initRouter, parseHash, updateHash, getParentPath } from './router.js';
import { loadProjects, loadProjectMeta } from './data-loader.js';
import { getState, updateState, getLastStepFor, setStepFor } from './state.js';
import { renderProjectGrid } from './view-project-grid.js';
import { renderViewer } from './view-viewer.js';

/**
 * Initialiserer applikasjonen
 * Kalles én gang når siden laster
 */
export function init() {
  // Initialiser router
  initRouter((route) => {
    handleRoute(route);
  });
}

/**
 * Håndterer ruteendringer
 * @param {Route} route - Route-objekt fra router
 */
async function handleRoute(route) {
  const root = document.getElementById('app');
  if (!root) {
    console.error('App container ikke funnet');
    return;
  }
  
  root.innerHTML = '';

  if (route.type === 'root') {
    // Last prosjekter og render galleri
    try {
      const projects = await loadProjects();
      const grid = renderProjectGrid(projects, (path) => {
        updateHash({ type: 'project', path });
      });
      root.appendChild(grid);
    } catch (error) {
      console.error('Kunne ikke laste prosjekter:', error);
      root.innerHTML = `<div style="padding: 2rem; text-align: center; font-size: var(--font-size-large);">
        <p>Oi! Kunne ikke laste prosjekter.</p>
        <p style="font-size: var(--font-size-base); margin-top: var(--spacing-md);">Spør en voksen om hjelp.</p>
      </div>`;
    }
  } else if (route.type === 'project') {
    // Last prosjektmetadata
    try {
      const meta = await loadProjectMeta(route.path);
      const lastStep = route.stepIndex ?? getLastStepFor(route.path);
      
      // Oppdater state
      updateState({
        currentPath: route.path,
        currentStepIndex: lastStep,
        currentProjectMeta: meta
      });
      
      // Render viewer med callbacks
      const viewer = renderViewer(getState(), {
        onPrevStep: () => {
          const state = getState();
          const newIndex = Math.max(0, state.currentStepIndex - 1);
          updateState({ currentStepIndex: newIndex });
          setStepFor(state.currentPath, newIndex);
          updateHash({ type: 'project', path: state.currentPath, stepIndex: newIndex });
        },
        onNextStep: () => {
          const state = getState();
          const maxIndex = (state.currentProjectMeta?.steps.length || 1) - 1;
          const newIndex = Math.min(maxIndex, state.currentStepIndex + 1);
          updateState({ currentStepIndex: newIndex });
          setStepFor(state.currentPath, newIndex);
          updateHash({ type: 'project', path: state.currentPath, stepIndex: newIndex });
        },
        onStepChange: (stepIndex) => {
          updateState({ currentStepIndex: stepIndex });
          const { currentPath } = getState();
          setStepFor(currentPath, stepIndex);
          updateHash({ type: 'project', path: currentPath, stepIndex });
        },
        onGoUp: () => {
          const { currentPath } = getState();
          const parentPath = getParentPath(currentPath);
          if (parentPath) {
            updateHash({ type: 'project', path: parentPath });
          } else {
            updateHash({ type: 'root' });
          }
        },
        onProjectClick: (path) => {
          updateHash({ type: 'project', path });
        }
      });
      root.appendChild(viewer);
    } catch (error) {
      console.error(`Kunne ikke laste prosjekt ${route.path}:`, error);
      root.innerHTML = `<div style="padding: 2rem; text-align: center; font-size: var(--font-size-large);">
        <p>Oi! Fant ikke prosjektet.</p>
        <p style="font-size: var(--font-size-base); margin-top: var(--spacing-md);">Spør en voksen om hjelp.</p>
      </div>`;
    }
  }
}

// Initialiser applikasjonen når DOM er klar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
