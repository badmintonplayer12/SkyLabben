/**
 * Prosjektgalleri-view
 *
 * Renderer grid/liste over prosjekter med cover-bilder og navn.
 */

import { getImageUrl, loadProjectMeta } from './data-loader.js';
import { getLastStepFor } from './state.js';
import { getFavoriteProjects, toggleFavoriteProject } from './favorites.js';

/**
 * Renderer prosjektgalleri
 * @param {Array<{id: string, name: string, path: string, hidden?: boolean, category?: string}>} projects
 * @param {function(string): void} onProjectClick
 * @returns {HTMLElement}
 */
export function renderProjectGrid(projects, onProjectClick) {
  const container = document.createElement('div');
  container.className = 'project-grid';

  const visibleProjects = projects.filter(project => !project.hidden);
  const metaCache = new Map();
  let favoriteSet = new Set(getFavoriteProjects());
  let selectedCategory = 'Alle';

  const categories = Array.from(
    new Set(
      visibleProjects
        .map(project => project.category || 'Uten kategori')
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const controls = document.createElement('div');
  controls.className = 'project-grid__controls';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'project-grid__search';
  searchInput.placeholder = 'Søk etter prosjekt...';
  searchInput.setAttribute('aria-label', 'Søk etter prosjekt');

  const categoriesContainer = document.createElement('div');
  categoriesContainer.className = 'project-grid__categories';

  controls.appendChild(searchInput);
  controls.appendChild(categoriesContainer);

  const tilesContainer = document.createElement('div');
  tilesContainer.className = 'project-grid__tiles';

  container.appendChild(controls);
  container.appendChild(tilesContainer);

  const FAVORITES_FILTER = '__favorites__';
  const categoryButtons = new Map();

  function createCategoryButton(label, value) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-grid__category-button';
    button.textContent = label;
    button.addEventListener('click', () => {
      selectedCategory = value;
      updateCategoryButtons();
      applyFilters();
    });
    categoriesContainer.appendChild(button);
    categoryButtons.set(value, button);
  }

  function updateCategoryButtons() {
    categoryButtons.forEach((button, value) => {
      const isActive = value === selectedCategory;
      button.classList.toggle('project-grid__category-button--active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  createCategoryButton('Alle', 'Alle');
  categories.forEach(category => {
    createCategoryButton(category, category);
  });
  createCategoryButton('Favoritter', FAVORITES_FILTER);
  updateCategoryButtons();

  searchInput.addEventListener('input', () => {
    applyFilters();
  });

  function getProjectMeta(path) {
    if (!metaCache.has(path)) {
      metaCache.set(
        path,
        loadProjectMeta(path).catch(error => {
          metaCache.delete(path);
          throw error;
        })
      );
    }
    return metaCache.get(path);
  }

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    let filtered = visibleProjects.filter(project => {
      if (!query) return true;
      return (project.name || '').toLowerCase().includes(query);
    });

    if (selectedCategory === FAVORITES_FILTER) {
      filtered = filtered.filter(project => favoriteSet.has(project.path));
    } else if (selectedCategory !== 'Alle') {
      filtered = filtered.filter(project => (project.category || 'Uten kategori') === selectedCategory);
    }

    renderTiles(filtered);
  }

  function renderTiles(list) {
    tilesContainer.innerHTML = '';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'project-grid__empty';
      empty.textContent = 'Ingen prosjekter matcher filtrene dine.';
      tilesContainer.appendChild(empty);
      return;
    }

    list.forEach(project => {
      tilesContainer.appendChild(createProjectTile(project));
    });
  }

  function createProjectTile(project) {
    const tile = document.createElement('div');
    tile.className = 'project-tile';
    tile.setAttribute('data-path', project.path);

    const favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.className = 'project-tile__favorite';
    favoriteButton.setAttribute('aria-label', 'Merk som favoritt');
    updateFavoriteButton(favoriteButton, favoriteSet.has(project.path));

    favoriteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const updated = toggleFavoriteProject(project.path);
      favoriteSet = new Set(updated);
      updateFavoriteButton(favoriteButton, favoriteSet.has(project.path));
      if (selectedCategory === FAVORITES_FILTER) {
        applyFilters();
      }
    });

    const img = document.createElement('img');
    img.className = 'project-tile__image';
    img.src = getImageUrl(project.path, 'cover.png');
    img.alt = project.name || 'Prosjekt';
    img.onerror = async () => {
      try {
        const meta = await getProjectMeta(project.path);
        const steps = meta?.steps || [];
        if (steps.length > 0) {
          const lastStep = steps[steps.length - 1];
          img.src = getImageUrl(project.path, lastStep);
        } else {
          img.style.display = 'none';
        }
      } catch (error) {
        console.warn(`Kunne ikke laste meta.json for ${project.path}, skjuler cover-bilde`);
        img.style.display = 'none';
      }
    };

    const name = document.createElement('div');
    name.className = 'project-tile__name';
    name.textContent = project.name;

    if (project.category) {
      const categoryLabel = document.createElement('div');
      categoryLabel.className = 'project-tile__category';
      categoryLabel.textContent = project.category;
      name.appendChild(categoryLabel);
    }

    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'project-tile__progress';

    getProjectMeta(project.path)
      .then(meta => {
        const steps = meta?.steps || [];
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
      })
      .catch(error => {
        console.warn(`Kunne ikke laste meta for progresjon: ${project.path}`, error);
        progressIndicator.style.display = 'none';
      });

    tile.appendChild(favoriteButton);
    tile.appendChild(img);
    tile.appendChild(name);
    tile.appendChild(progressIndicator);

    tile.addEventListener('click', () => {
      onProjectClick(project.path);
    });

    return tile;
  }

  function updateFavoriteButton(button, isFavorite) {
    button.classList.toggle('project-tile__favorite--active', isFavorite);
    button.setAttribute('aria-pressed', String(isFavorite));
    button.textContent = isFavorite ? '?' : '?';
  }

  applyFilters();
  return container;
}
