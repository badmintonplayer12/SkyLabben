/**
 * Prosjektgalleri-view
 *
 * Renderer grid/liste over prosjekter med cover-bilder og navn.
 */

import { getImageUrl, loadProjectMeta } from './data-loader.js';
import { getLastStepFor } from './state.js';
import { getFavoriteProjects, toggleFavoriteProject } from './favorites.js';
import { shareUrl } from './share.js';
import { getMode, getOverrides, setOverride, isVisibleForKidsNow, getOverrideKey, setMode } from './visibility.js';
import { isInstallAvailable, consumePrompt, isStandalone } from './pwa-install.js';
import { showParentQuizDialog } from './parent-quiz.js';

const FILTER_STORAGE_KEY = 'legoInstructions.gridFilters';

function loadFilterState() {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (!stored) return { category: 'Alle', favoritesOnly: false };
    const parsed = JSON.parse(stored);
    return {
      category: parsed?.category || 'Alle',
      favoritesOnly: Boolean(parsed?.favoritesOnly)
    };
  } catch (e) {
    return { category: 'Alle', favoritesOnly: false };
  }
}

function saveFilterState(state) {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Ignorer lagringsfeil
  }
}

/**
 * Renderer prosjektgalleri
 * @param {Array<{id: string, name: string, path: string, hidden?: boolean, category?: string}>} projects
 * @param {function(string): void} onProjectClick
 * @returns {HTMLElement}
 */
export function renderProjectGrid(projects, onProjectClick) {
  const container = document.createElement('div');
  container.className = 'project-grid';

  let mode = getMode();
  let overrides = getOverrides();
  const getBaseProjects = () => (mode === 'parent' ? projects : projects.filter(project => !project.hidden));
  const metaCache = new Map();
  let favoriteSet = new Set(getFavoriteProjects());
  let selectedCategory = 'Alle';
  let favoritesOnly = false;

  const categories = Array.from(
    new Set(
      getBaseProjects()
        .map(project => project.category || 'Uten kategori')
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const storedFilters = loadFilterState();

  const controls = document.createElement('div');
  controls.className = 'project-grid__controls';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'project-grid__search';
  searchInput.placeholder = 'Søk etter prosjekt...';
  searchInput.setAttribute('aria-label', 'Søk etter prosjekt');

  const categoriesContainer = document.createElement('div');
  categoriesContainer.className = 'project-grid__categories';

  const categorySelect = document.createElement('select');
  categorySelect.className = 'project-grid__category-select';
  categorySelect.setAttribute('aria-label', 'Velg kategori');
  const allOption = document.createElement('option');
  allOption.value = 'Alle';
  allOption.textContent = 'Alle';
  categorySelect.appendChild(allOption);
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
  selectedCategory = categories.includes(storedFilters.category) ? storedFilters.category : 'Alle';
  categorySelect.value = selectedCategory;

  const favoriteToggle = document.createElement('button');
  favoriteToggle.type = 'button';
  favoriteToggle.className = 'project-grid__favorite-toggle';
  favoriteToggle.setAttribute('aria-pressed', 'false');
  favoriteToggle.setAttribute('aria-label', 'Vis bare favoritter');
  favoriteToggle.textContent = '☆';

  const settingsContainer = document.createElement('div');
  settingsContainer.className = 'project-grid__settings';
  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.className = 'viewer__button viewer__button--settings';
  settingsButton.setAttribute('aria-label', 'Innstillinger');
  settingsButton.title = 'Innstillinger';
  settingsButton.textContent = '⚙️';
  settingsContainer.appendChild(settingsButton);

  const searchRow = document.createElement('div');
  searchRow.className = 'project-grid__search-row';
  searchRow.appendChild(searchInput);
  searchRow.appendChild(categorySelect);
  searchRow.appendChild(favoriteToggle);
  searchRow.appendChild(settingsContainer);
  controls.appendChild(searchRow);

  const header = document.createElement('div');
  header.className = 'project-grid__header app-header';
  header.appendChild(controls);

  const tilesContainer = document.createElement('div');
  tilesContainer.className = 'project-grid__tiles';

  container.appendChild(header);
  container.appendChild(tilesContainer);

  let settingsPanel = null;
  const rootUrl = (() => {
    const baseUrl = window.location.origin + window.location.pathname;
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  })();

  const closeSettingsPanel = () => {
    if (settingsPanel && settingsPanel.parentNode) {
      settingsPanel.parentNode.removeChild(settingsPanel);
    }
    settingsPanel = null;
    document.removeEventListener('pointerdown', handleOutside);
    document.removeEventListener('keydown', handleEsc);
  };

  const handleOutside = (e) => {
    if (settingsPanel && !settingsPanel.contains(e.target) && e.target !== settingsButton) {
      closeSettingsPanel();
    }
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeSettingsPanel();
    }
  };

  const isFullscreen = () => !!document.fullscreenElement;
  const toggleFullscreen = () => {
    if (isFullscreen()) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } else {
      const target = document.documentElement || document.body;
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(() => {});
      }
    }
  };

  const handleModeToggle = () => {
    const current = getMode();
    if (current === 'parent') {
      setMode('child');
      mode = getMode();
      applyFilters();
      closeSettingsPanel();
      return;
    }
    showParentQuizDialog({
      onSuccess: () => {
        mode = getMode();
        applyFilters();
        closeSettingsPanel();
      }
    });
  };

  const createPanelButton = (label, onClick, icon) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'project-grid__settings-item';
    if (icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'project-grid__settings-icon';
      iconSpan.textContent = icon;
      btn.appendChild(iconSpan);
    }
    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    btn.appendChild(labelSpan);
    btn.addEventListener('click', () => {
      onClick();
      closeSettingsPanel();
    });
    return btn;
  };

  const openSettingsPanel = () => {
    if (settingsPanel) {
      closeSettingsPanel();
      return;
    }
    settingsPanel = document.createElement('div');
    settingsPanel.className = 'project-grid__settings-panel';

    const modeButton = createPanelButton(
      mode === 'parent' ? 'Til barnemodus' : 'Foreldremodus',
      handleModeToggle,
      mode === 'parent' ? '👶' : '🔒'
    );
    settingsPanel.appendChild(modeButton);

    const shareButton = createPanelButton('Del app', async () => {
      await shareUrl({
        url: rootUrl,
        title: 'SkyLabben',
        text: 'SkyLabben - LEGO-instruksjonsviser',
        container: document.body
      });
    }, '🔗');
    settingsPanel.appendChild(shareButton);

    const fullscreenButton = createPanelButton(
      isFullscreen() ? 'Avslutt fullskjerm' : 'Fullskjerm',
      toggleFullscreen,
      '⛶'
    );
    settingsPanel.appendChild(fullscreenButton);

    if (isInstallAvailable() && !isStandalone()) {
      const installButton = createPanelButton('Installer app', async () => {
        try {
          await consumePrompt();
        } catch (e) {
          console.warn('Kunne ikke vise install prompt:', e);
        }
      }, '⬇️');
      settingsPanel.appendChild(installButton);
    }

    settingsContainer.appendChild(settingsPanel);
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    document.addEventListener('fullscreenchange', () => {
      if (settingsPanel) {
        const anyFull = isFullscreen();
        fullscreenButton.querySelector('span:nth-child(2)').textContent = anyFull ? 'Avslutt fullskjerm' : 'Fullskjerm';
      }
    });
  };

  settingsButton.addEventListener('click', (e) => {
    e.stopPropagation();
    openSettingsPanel();
  });

  searchInput.addEventListener('input', () => {
    applyFilters();
  });

  categorySelect.addEventListener('change', () => {
    selectedCategory = categorySelect.value;
    saveFilterState({ category: selectedCategory, favoritesOnly });
    applyFilters();
  });

  const updateFavoriteToggle = () => {
    favoriteToggle.setAttribute('aria-pressed', String(favoritesOnly));
    favoriteToggle.textContent = favoritesOnly ? '★' : '☆';
    favoriteToggle.style.color = favoritesOnly ? '#f5c000' : '';
    favoriteToggle.setAttribute(
      'aria-label',
      favoritesOnly ? 'Vis alle prosjekter' : 'Vis bare favoritter'
    );
  };
  favoritesOnly = storedFilters.favoritesOnly === true;
  updateFavoriteToggle();

  favoriteToggle.addEventListener('click', () => {
    favoritesOnly = !favoritesOnly;
    updateFavoriteToggle();
    if (favoritesOnly) {
      selectedCategory = 'Alle';
      categorySelect.value = 'Alle';
    }
    saveFilterState({ category: selectedCategory, favoritesOnly });
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
    let filtered = getBaseProjects().filter(project => {
      if (!query) return true;
      return (project.name || '').toLowerCase().includes(query);
    });

    if (!favoritesOnly && selectedCategory !== 'Alle') {
      filtered = filtered.filter(project => (project.category || 'Uten kategori') === selectedCategory);
    }

    if (favoritesOnly) {
      filtered = filtered.filter(project => favoriteSet.has(project.path));
    }

    if (mode === 'child') {
      filtered = filtered.filter(project => {
        return isVisibleForKidsNow(
          {
            id: project.id || project.path,
            approvedByDefault: project.approvedByDefault,
            releaseAt: project.releaseAt
          },
          overrides
        );
      });
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
      if (favoritesOnly) {
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

    if (mode === 'parent') {
      const toggleWrapper = document.createElement('label');
      toggleWrapper.className = 'visibility-toggle';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      const label = document.createElement('span');
      label.textContent = 'Synlig for barn på denne enheten';

      const key = getOverrideKey({ projectId: project.id || project.path });
      const currentOverride = key ? overrides[key] : undefined;
      const defaultVisible = project.approvedByDefault !== false;
      checkbox.checked = currentOverride === undefined ? defaultVisible : currentOverride === 'visible';

      checkbox.addEventListener('change', () => {
        const newValue = checkbox.checked ? 'visible' : 'hidden';
        overrides = setOverride(key, newValue);
        applyFilters();
      });

      toggleWrapper.appendChild(checkbox);
      toggleWrapper.appendChild(label);
      tile.appendChild(toggleWrapper);
    }

    tile.addEventListener('click', () => {
      onProjectClick(project.path);
    });

    return tile;
  }

  function updateFavoriteButton(button, isFavorite) {
    button.classList.toggle('project-tile__favorite--active', isFavorite);
    button.setAttribute('aria-pressed', String(isFavorite));
    button.textContent = isFavorite ? '★' : '☆';
    button.setAttribute('title', isFavorite ? 'Fjern fra favoritter' : 'Legg til favoritter');
  }

  applyFilters();
  return container;
}
