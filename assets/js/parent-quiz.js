import { openDialog } from './dialog.js';
import { getRandomAdultChallenge, setMode } from './visibility.js';

/**
 * Viser en enkel matte-quiz for å aktivere foreldremodus.
 * @param {Object} params
 * @param {() => void} [params.onSuccess] Callback ved riktig svar
 * @returns {{close: () => void}}
 */
export function showParentQuizDialog({ onSuccess } = {}) {
  const challenge = getRandomAdultChallenge();

  const wrapper = document.createElement('div');
  wrapper.className = 'parent-quiz';

  const question = document.createElement('p');
  question.textContent = challenge.question;

  const input = document.createElement('input');
  input.type = 'number';
  input.inputMode = 'numeric';
  input.autocomplete = 'off';
  input.autofocus = true;
  input.placeholder = 'Svar';
  input.className = 'parent-quiz__input';

  const error = document.createElement('div');
  error.className = 'parent-quiz__error';

  wrapper.appendChild(question);
  wrapper.appendChild(input);
  wrapper.appendChild(error);

  return openDialog({
    title: 'Foreldremodus',
    content: wrapper,
    size: 'sm',
    onClose: () => {
      error.textContent = '';
    },
    actions: [
      { label: 'Avbryt', variant: 'secondary' },
      {
        label: 'OK',
        variant: 'primary',
        onClick: () => {
          const value = parseInt(input.value, 10);
          if (Number.isInteger(value) && value === challenge.answer) {
            setMode('parent');
            if (typeof onSuccess === 'function') {
              onSuccess();
            }
            return;
          }
          error.textContent = 'Feil svar. Prøv igjen.';
          input.focus();
          return false; // behold dialogen åpen
        }
      }
    ]
  });
}
