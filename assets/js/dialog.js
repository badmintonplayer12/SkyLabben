/**
 * Generisk dialogmodul for modaler med backdrop, ESC/backdrop-lukk og aksjonsknapper.
 */

let activeDialog = null;

function cleanup() {
  if (!activeDialog) return;
  const { backdrop, dialog, keyHandler, onClose, previousOverflow, previousFocus } = activeDialog;
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
  }
  if (backdrop?.parentNode) backdrop.parentNode.removeChild(backdrop);
  document.body.style.overflow = previousOverflow || '';
  if (typeof onClose === 'function') {
    onClose();
  }
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
  activeDialog = null;
}

export function closeDialog() {
  cleanup();
}

/**
 * Åpner en dialog.
 * @param {Object} params
 * @param {string} [params.title]
 * @param {Node|string} [params.content]
 * @param {Array<{label: string, variant?: string, onClick?: () => void}>} [params.actions]
 * @param {'sm'|'md'|'lg'} [params.size]
 * @param {() => void} [params.onClose]
 * @returns {{close: () => void}}
 */
export function openDialog({
  title,
  content,
  actions = [],
  size = 'md',
  onClose
} = {}) {
  // Lukk eksisterende dialog før ny åpnes
  cleanup();

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const previousFocus = document.activeElement;

  const backdrop = document.createElement('div');
  backdrop.className = 'app-dialog__backdrop';

  const dialog = document.createElement('div');
  dialog.className = `app-dialog app-dialog--${size || 'md'}`;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  if (title) {
    const header = document.createElement('div');
    header.className = 'app-dialog__header';
    header.textContent = title;
    dialog.appendChild(header);
    dialog.setAttribute('aria-label', title);
  }

  const body = document.createElement('div');
  body.className = 'app-dialog__body';
  if (content instanceof Node) {
    body.appendChild(content);
  } else if (typeof content === 'string') {
    body.innerHTML = content;
  }
  dialog.appendChild(body);

  if (actions && actions.length > 0) {
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'app-dialog__actions';
    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'app-dialog__button';
      if (action.variant) {
        btn.classList.add(`app-dialog__button--${action.variant}`);
      }
      btn.textContent = action.label || 'OK';
      btn.addEventListener('click', () => {
        let result;
        if (typeof action.onClick === 'function') {
          result = action.onClick();
        }
        if (result === false) {
          return;
        }
        cleanup();
      });
      actionsContainer.appendChild(btn);
    });
    dialog.appendChild(actionsContainer);
  }

  const keyHandler = (evt) => {
    if (evt.key === 'Escape') {
      cleanup();
    }
  };

  backdrop.addEventListener('click', (evt) => {
    if (evt.target === backdrop) {
      cleanup();
    }
  });
  document.addEventListener('keydown', keyHandler);

  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  // Fokus
  const focusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) {
    focusable.focus();
  } else {
    dialog.focus({ preventScroll: true });
  }

  activeDialog = {
    backdrop,
    dialog,
    keyHandler,
    onClose,
    previousOverflow,
    previousFocus
  };

  return { close: cleanup };
}
