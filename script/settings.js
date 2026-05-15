import { COLOR_SCHEMES } from './color-schemes.js';

const ID = 'sr5-custom-ui';

// All --sr5cui-* vars managed by the scheme system.
// Listed here so applyScheme can clear stale values before applying a new scheme.
const SCHEME_VARS = [
  '--sr5cui-bg',
  '--sr5cui-bg-image',
  '--sr5cui-bg-overlay',
  '--sr5cui-window-border',
  '--sr5cui-header-bg',
  '--sr5cui-input-bg',
  '--sr5cui-input-color',
  '--sr5cui-roll-btn-bg',
  '--sr5cui-roll-btn-border',
  '--sr5cui-roll-btn-hover-bg',
  '--sr5cui-roll-btn-hover-border',
  '--sr5cui-roll-btn-hover-shadow',
  '--sr5cui-roll-btn-icon-color',
  // Common button vars (form-dialog buttons, card .button, glitch-content)
  '--sr5cui-btn-bg',
  '--sr5cui-btn-border',
  '--sr5cui-btn-hover-bg',
  '--sr5cui-btn-hover-shadow',
  '--sr5cui-cancel-bg',
  '--sr5cui-cancel-border',
  '--sr5cui-cancel-color',
  '--sr5cui-cancel-hover-bg',
  '--sr5cui-cancel-hover-border',
  '--sr5cui-cancel-hover-color',
  '--sr5cui-cancel-hover-shadow',
  '--sr5cui-icon-color',
  '--sr5cui-stepper-bg',
  '--sr5cui-stepper-border',
  '--sr5cui-stepper-hover-bg',
  '--sr5cui-stepper-hover-border',
  '--sr5cui-accent',
  '--sr5cui-shadow',
  '--sr5cui-list-section-color',
  '--sr5cui-list-section-bg',
  '--sr5cui-list-section-border',
  '--sr5cui-list-header-color',
  '--sr5cui-list-item-color',
  '--sr5cui-list-header-bg',
  '--sr5cui-list-header-border',
  '--sr5cui-hover-text-shadow',
  '--sr5cui-hover-color',
  '--sr5cui-tab-bg',
  '--sr5cui-tab-color',
  '--sr5cui-tab-shadow',
  '--sr5cui-tab-active-color',
  '--sr5cui-tab-active-shadow',
  '--sr5cui-list-img-hover-bg',
  '--sr5cui-tab-active-bg',
  '--sr5cui-tab-active-box-shadow',
  '--sr5cui-label-color',
  '--sr5cui-static-label-color',
  '--sr5cui-link-color',
  '--sr5cui-horizontal-line',
  '--sr5cui-scrollbar-thumb',
  '--sr5cui-scrollbar-track',
  '--sr5cui-attribute-bg',
  '--sr5cui-input-focus',
  '--sr5cui-placeholder-color',
  '--sr5cui-img-container-bg',
  '--sr5cui-editor-menu-bg',
  '--sr5cui-list-desc-bg',
  '--sr5cui-list-desc-color',
  '--sr5cui-hint-color',
  '--sr5cui-checkbox-bg',
  '--sr5cui-checkbox-border',
  '--sr5cui-checkbox-checked-border',
  '--sr5cui-checkbox-mark-color',
  '--sr5cui-select-opt-bg',
  '--sr5cui-select-opt-color',
  '--sr5cui-select-opt-selected-bg',
  '--sr5cui-select-opt-selected-color',
  // Chat card roll-mode accents
  '--sr5cui-card-public-accent',
  '--sr5cui-card-gm-accent',
  '--sr5cui-card-blind-accent',
  '--sr5cui-card-self-accent',
  '--sr5cui-card-overlay',
  '--sr5cui-dark-overlay',
  '--sr5cui-card-image',
  '--sr5cui-edit-mode-bg',
  '--sr5cui-test-row-border',
  '--sr5cui-test-row-shadow',
];

function applyScheme(schemeId) {
  const scheme = COLOR_SCHEMES.find(s => s.id === schemeId) ?? COLOR_SCHEMES[0];
  const root = document.documentElement;
  // Clear all known vars first so switching schemes never leaves stale values.
  for (const prop of SCHEME_VARS) root.style.removeProperty(prop);
  for (const [prop, val] of Object.entries(scheme.vars)) {
    root.style.setProperty(prop, val);
  }
  // Toggle a body class per scheme (for background-image and other things CSS vars can't do).
  for (const s of COLOR_SCHEMES) {
    document.body.classList.toggle(`sr5cui-scheme-${s.id}`, s.id === scheme.id);
  }
  // Gate all custom color CSS under this class; absent = SR5 default colors unchanged.
  document.body.classList.toggle('sr5cui-colors', scheme.id !== 'default');

  // Re-stamp inline backgrounds on already-open .sr5v2 and .journal-sheet windows
  // so DevTools element.style shows a literal gradient value (editable with picker).
  const overlay = scheme.vars['--sr5cui-bg-overlay'] ?? '';
  const image   = scheme.vars['--sr5cui-bg-image']   ?? '';
  const bg = [overlay, image].filter(Boolean).join(', ');
  for (const el of document.querySelectorAll('.sr5v2, .journal-sheet')) {
    for (const target of [el, el.querySelector?.('.window-content')]) {
      if (!target) continue;
      target.style.background       = bg || '';
      target.style.backgroundSize   = bg ? 'auto'   : '';
      target.style.backgroundRepeat = bg ? 'repeat' : '';
    }
  }
}

function applyToggle(key, cssClass) {
  document.body.classList.toggle(cssClass, game.settings.get(ID, key));
}

function applyAll() {
  applyScheme(game.settings.get(ID, 'colorScheme'));
  applyToggle('useCustomLayout', 'sr5cui-layout');
  applyToggle('useRollButtons', 'sr5cui-roll-buttons');
  applyToggle('hideRollPrivacy', 'sr5cui-hide-roll-privacy');
  applyToggle('disableSrTooltips', 'sr5cui-no-tooltips');
}

export function registerSettings() {
  const schemeChoices = Object.fromEntries(COLOR_SCHEMES.map(s => [s.id, s.label]));

  game.settings.register(ID, 'colorScheme', {
    name: 'Color Scheme',
    hint: 'Visual color theme for the SR5 custom UI.',
    scope: 'client',           // each player picks their own
    config: true,
    type: String,
    default: 'default',
    choices: schemeChoices,
    onChange: applyScheme,
  });

  game.settings.register(ID, 'useCustomLayout', {
    name: 'Custom Layout & Sizes',
    hint: 'Apply custom sheet layout, spacing, and font-size changes.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: () => applyToggle('useCustomLayout', 'sr5cui-layout'),
  });

  game.settings.register(ID, 'useRollButtons', {
    name: 'Custom Roll Buttons in Test Dialogs',
    hint: 'Replace the roll-mode dropdown with specified roll buttons. Re-open the dialog to see the changes.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: v => {
      applyToggle('useRollButtons', 'sr5cui-roll-buttons');
      if (!v) game.settings.set(ID, 'hideRollPrivacy', false);
    },
  });

  game.settings.register(ID, 'hideRollPrivacy', {
    name: '.....Hide Redundant Roll-Mode Selectors',
    hint: ' ',
    scope: 'client',
    config: true,
    type: Boolean,
    default: false,
    onChange: () => applyToggle('hideRollPrivacy', 'sr5cui-hide-roll-privacy'),
  });
  
  game.settings.register(ID, 'diceAccordion', {
    name: 'Dice Visibility in Roll Cards',
    hint: 'When enabled, test cards and roll messages show their dice immediately. ' +
          'New messages collapse previous dice.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(ID, 'disableSrTooltips', {
    name: 'Disable SR5 Tooltips',
    hint: 'Hide the SR5 value-modifier tooltips that appear when hovering over attributes and other values.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: false,
    onChange: () => applyToggle('disableSrTooltips', 'sr5cui-no-tooltips'),
  });

  // Indent "Hide Roll Privacy" under "Custom Roll Buttons" and disable it when roll buttons are off.
  Hooks.on('renderSettingsConfig', (_app, html) => {
    const root = html instanceof HTMLElement ? html : (html[0] ?? html);
    const privacyRow  = root.querySelector('[data-setting-id="sr5-custom-ui.hideRollPrivacy"]');
    const rollBtnInput = root.querySelector('[name="sr5-custom-ui.useRollButtons"]');
    if (!privacyRow || !rollBtnInput) return;
    privacyRow.style.paddingLeft = '2em';
    function sync() {
      const enabled = rollBtnInput.checked;
      const input = privacyRow.querySelector('input');
      if (input) input.disabled = !enabled;
      privacyRow.style.opacity = enabled ? '' : '0.5';
    }
    sync();
    rollBtnInput.addEventListener('change', sync);
  });
}

export { applyAll };
