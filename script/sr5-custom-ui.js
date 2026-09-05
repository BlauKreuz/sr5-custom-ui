/**
 * SR5 Custom UI
 *
 * Replaces the roll-mode dropdown + generic Roll button in every TestDialog
 * with four dedicated roll-mode buttons (Public / GM / Blind / Self).
 */

import { registerSettings, applyAll } from './settings.js';

/** Icons for each Foundry roll mode */
const ROLL_MODE_ICONS = {
    publicroll: 'fas fa-globe',
    gmroll:     'fas fa-user-secret',
    blindroll:  'fas fa-eye-slash',
    selfroll:   'fas fa-user',
};

/** Ordered list of roll modes to display */
const ROLL_MODE_ORDER = ['publicroll', 'gmroll', 'blindroll', 'selfroll'];

// ============================================================
// Safety patch: SR5 0.37.1 can pass a rollMode into ChatMessage.applyMode
// that isn't a key of CONFIG.ChatMessage.rollModes (e.g. item rolls that
// skip the dialog), crashing on "Cannot read properties of undefined
// (reading 'handler')". Fall back to the core default roll mode instead.
// ============================================================
function patchChatMessageApplyMode() {
    if (ChatMessage.applyMode.__sr5cuiPatched) return;
    const original = ChatMessage.applyMode.bind(ChatMessage);
    const patched = function (chatData, rollMode, ...rest) {
        if (!CONFIG.ChatMessage?.rollModes?.[rollMode]) {
            rollMode = game.settings.get('core', 'rollMode');
        }
        return original(chatData, rollMode, ...rest);
    };
    patched.__sr5cuiPatched = true;
    ChatMessage.applyMode = patched;
}

// ============================================================
// Template overrides
// ============================================================
// Fetches a .hbs file from this module's templates/ folder and
// registers it under the given SR5 system partial path so
// Handlebars.partials[systemPath] resolves to our version first.
async function registerTemplateOverride(systemPath, moduleFile) {
    const res = await fetch(`modules/sr5-custom-ui/templates/${moduleFile}`);
    if (!res.ok) {
        console.error(`SR5 Custom UI | Failed to load template override: ${moduleFile} (${res.status})`);
        return;
    }
    const source = await res.text();
    Handlebars.registerPartial(systemPath, Handlebars.compile(source));
}

// ============================================================
// Module settings + template overrides  (both run on 'init')
// ============================================================
Hooks.on('init', async () => {
    patchChatMessageApplyMode();

    // ── Module settings (color scheme, layout, roll buttons toggles) ──
    registerSettings();

    // ── Setting: roll card reveal delay ──────────────────────
    game.settings.register('sr5-custom-ui', 'rollCardDelay', {
        name: 'Roll Card Reveal Delay (seconds)',
        hint: 'How many seconds to wait before showing SR5 roll result cards in chat. ' +
              'Set this to match your Dice So Nice animation duration so the card appears after the dice settle. ' +
              '0 = show immediately.',
        scope: 'world',   // GM-controlled, stored server-side
        config: true,
        type: Number,
        default: 3,
        range: { min: 0, max: 30, step: 0.5 },
    });

    // ── Setting: notification card display duration ───────────
    game.settings.register('sr5-custom-ui', 'rollNotifDuration', {
        name: 'Roll Notification Duration (seconds)',
        hint: 'How many seconds the SR5 roll result card stays visible in the floating ' +
              'notification area after it has been revealed. ' +
              '0 = use Foundry\u2019s default (~5 s from when the card was posted).',
        scope: 'world',
        config: true,
        type: Number,
        default: 5,
        range: { min: 0, max: 10, step: 1 },
    });

    // ── Setting: hide offline matrix rows from players ────────
    game.settings.register('sr5-custom-ui', 'hideMatrixOfflineRows', {
        name: 'Hide Offline Matrix Icons From Players',
        hint: 'When enabled, network icon rows marked "Offline" on the Matrix tab are hidden from non-GM users.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => _applyMatrixOfflineVisibility(),
    });

    // Template overrides are registered in the 'ready' hook below.
    // Reason: the SR5 system calls loadTemplates() during 'init', which sends
    // socket requests that come back asynchronously and overwrite any
    // registerPartial() calls we make here.  By the time 'ready' fires all
    // those socket responses have settled, so our registerPartial() wins.
});

Hooks.on('ready', async () => {
    applyAll();

    // ── SR5 tooltip suppression ────────────────────────────────
    // Patch game.tooltip.activate so that when 'disableSrTooltips' is on,
    // tooltips triggered from inside .sr5v2 (actor sheets, test dialogs, etc.)
    // are suppressed, while Foundry sidebar and other UI tooltips still work.
    const _origActivate = game.tooltip.activate.bind(game.tooltip);
    game.tooltip.activate = function(element, options) {
        if (document.body.classList.contains('sr5cui-no-tooltips') &&
            element?.closest?.('.sr5v2, .sr5') &&
            !element?.closest?.('.list-item-favorites')) {
            return;
        }
        return _origActivate(element, options);
    };

    // ── Template overrides ─────────────────────────────────────
    // Registered here (not in 'init') because the SR5 system calls
    // loadTemplates() during 'init', sending socket requests whose responses
    // arrive asynchronously and overwrite any registerPartial() made in 'init'.
    // By 'ready' all those socket responses have settled, so our versions win.
    // To add a new override: copy the system file to templates/, add a row here.
    //
    // Registrations are conditional on useCustomLayout / useRollButtons.
    // Changing either setting requires a page reload for template changes to take
    // effect — Handlebars partials are compiled once at ready time.  The settings
    // raise Foundry's reload prompt via requiresReload: true; CSS class toggles
    // (body.sr5cui-layout, body.sr5cui-roll-buttons) are still instant.
    const SR5         = 'systems/shadowrun5e/dist/templates';
    const useLayout   = game.settings.get('sr5-custom-ui', 'useCustomLayout');
    const useRollBtns = game.settings.get('sr5-custom-ui', 'useRollButtons');

    const templates = [
        // ── Always active ──────────────────────────────────────────────────────
        // Supply result-type classes, roll icons, and damage display used by the
        // color-scheme and dice-accordion CSS regardless of other settings.
        [`${SR5}/rolls/success-test-message.hbs`,                       'success-test-message.hbs'],
        // Parent wrappers that call success-test-message as a partial
        [`${SR5}/rolls/opposed-actor-creator-message.hbs`,              'rolls/opposed-actor-creator-message.hbs'],
        [`${SR5}/rolls/opposing-check-overwatch-score-message.hbs`,     'rolls/opposing-check-overwatch-score-message.hbs'],
        [`${SR5}/rolls/opposing-mark-test-message.hbs`,                 'rolls/opposing-mark-test-message.hbs'],
        // Damage partials inside test message
        [`${SR5}/rolls/parts/DamagePair.hbs`,                           'rolls/parts/DamagePair.hbs'],
        [`${SR5}/rolls/parts/Damage.hbs`,                               'rolls/parts/Damage.hbs'],
        // Adds data-network to each network icon row so it can be targeted for GM-only visibility.
        [`${SR5}/v2/list-items/network_icon/item.hbs`,                  'list-items/network_icon/item.hbs'],
    ];

    // ── Custom Roll Buttons OR Custom Layout ───────────────────────────────────
    // success-test-documents: wraps the actor + item header pair in
    // .sr5cui-documents-row.  Layout uses flex to display them side by side;
    // roll buttons need the wrapper present in the dialog DOM as well.
    if (useRollBtns || useLayout) {
        templates.push(
            [`${SR5}/apps/dialogs/parts/success-test-documents.hbs`, 'success-test-documents.hbs'],
        );
    }

    // ── Custom Roll Buttons ────────────────────────────────────────────────────
    // success-test-common: removes the SR5 roll-mode dropdown (replaced by the
    //   custom buttons).  Without this override the dropdown and custom buttons
    //   coexist and conflict.
    // success-test-entry: adds stepper widget markup for Pool / Limit rows.
    if (useRollBtns) {
        templates.push(
            [`${SR5}/apps/dialogs/ranged-attack-test-dialog.hbs`,  'ranged-attack-test-dialog.hbs'],
            [`${SR5}/apps/dialogs/parts/success-test-common.hbs`, 'success-test-common.hbs'],
            [`${SR5}/apps/dialogs/parts/success-test-entry.hbs`,  'success-test-entry.hbs'],
        );
    }

    // ── Custom Layout & Sizes ──────────────────────────────────────────────────
    // Actor sheet and list-item templates for layout / spacing / font-size changes.
    if (useLayout) {
        templates.push(
            // Actor sheet – root
            [`${SR5}/v2/actor/header.hbs`,                                  'actor/header.hbs'],
            [`${SR5}/v2/actor/footer.hbs`,                                  'actor/footer.hbs'],
            // Actor sheet – tabs
            [`${SR5}/v2/actor/tabs/character-skills.hbs`,                   'actor/tabs/character-skills.hbs'],
            [`${SR5}/v2/actor/tabs/bio.hbs`,                                'actor/tabs/bio.hbs'],
            [`${SR5}/v2/actor/tabs/inventory.hbs`,                          'actor/tabs/inventory.hbs'],
            [`${SR5}/v2/actor/tabs/magic.hbs`,                              'actor/tabs/magic.hbs'],
            [`${SR5}/v2/actor/tabs/matrix.hbs`,                             'actor/tabs/matrix.hbs'],
            [`${SR5}/v2/actor/tabs/description.hbs`,                        'actor/tabs/description.hbs'],
            [`${SR5}/v2/actor/tabs/social.hbs`,                             'actor/tabs/social.hbs'],
            [`${SR5}/v2/actor/tabs/effects.hbs`,                            'actor/tabs/effects.hbs'],
            [`${SR5}/v2/actor/tabs/misc.hbs`,                               'actor/tabs/misc.hbs'],
            [`${SR5}/v2/actor/tabs/actions.hbs`,                            'actor/tabs/actions.hbs'],
            // Actor sheet – parts
            [`${SR5}/v2/actor/parts/attributes.hbs`,                        'actor/parts/attributes.hbs'],
            [`${SR5}/v2/actor/parts/attribute.hbs`,                         'actor/parts/attribute.hbs'],
            [`${SR5}/v2/actor/parts/active-skills.hbs`,                     'actor/parts/active-skills.hbs'],
            [`${SR5}/v2/actor/parts/language-and-knowledge-skills.hbs`,     'actor/parts/language-and-knowledge-skills.hbs'],
            [`${SR5}/v2/actor/parts/condition-monitor.hbs`,                 'actor/parts/condition-monitor.hbs'],
            [`${SR5}/v2/actor/parts/initiative.hbs`,                        'actor/parts/initiative.hbs'],
            [`${SR5}/v2/actor/parts/limits.hbs`,                            'actor/parts/limits.hbs'],
            [`${SR5}/v2/actor/parts/movement.hbs`,                          'actor/parts/movement.hbs'],
            [`${SR5}/v2/actor/parts/special-attributes.hbs`,                'actor/parts/special-attributes.hbs'],
            [`${SR5}/v2/actor/parts/common-rolls.hbs`,                      'actor/parts/common-rolls.hbs'],
            // List-item – collapse/expand toggle icon
            [`${SR5}/v2/list-items/toggle-expand-icon.hbs`,                 'list-items/toggle-expand-icon.hbs'],
            // Skill list header – adds sr5cui-static-label class to non-rtg labels
            [`${SR5}/v2/list-items/skill/header.hbs`,                       'list-items/skill/header.hbs'],
        );
    }

    await Promise.all(templates.map(([sys, mod]) => registerTemplateOverride(sys, mod)));
});

// ============================================================
// Code-row toggle – click card-content--code to show/hide metrics.
// Uses delegated listener so it works for every card regardless of
// when renderChatMessageHTML fires or how many times it re-fires.
// ============================================================
let _codeToggleReady = false;
function setupCodeToggle() {
    if (_codeToggleReady) return;
    _codeToggleReady = true;
    document.addEventListener('click', e => {
        const toggle = e.target.closest('.sr5cui-code-toggle');
        if (!toggle) return;
        // Find the next sibling that is the metrics section.
        let sib = toggle.nextElementSibling;
        while (sib && !sib.classList.contains('card-content--metrics')) {
            sib = sib.nextElementSibling;
        }
        if (!sib) return;
        const hidden = sib.classList.toggle('sr5cui-metrics-hidden');
        toggle.classList.toggle('sr5cui-metrics-open', !hidden);
    });
}

// ============================================================
// Show-roll toggle – replace SR5's jQuery slideUp/slideDown (200 ms,
// asymmetric feel) with a CSS max-height transition so expand and
// collapse use identical 0.25s ease-in-out speed.
// Intercepts the click in capture phase so it runs before SR5's
// bubbling jQuery handler.
// display is managed inline (block on expand, none after collapse)
// so the collapsed element is completely out of layout, identical to
// SR5's original display:none state and preserving accordion behaviour.
// ============================================================
let _showRollReady = false;
function setupShowRollToggle() {
    if (_showRollReady) return;
    _showRollReady = true;
    document.addEventListener('click', e => {
        const btn = e.target.closest('.show-roll');
        if (!btn) return;
        const card = btn.closest('.chat-card');
        if (!card) return;
        const cardRolls = card.querySelector('.card-rolls');
        if (!cardRolls) return;
        const hasContent = cardRolls.querySelector('.dice-rolls, .dice-roll-content');
        if (!hasContent) return;
        // Stop SR5's jQuery handler from also firing.
        e.stopImmediatePropagation();
        if (cardRolls.classList.contains('sr5cui-rolls-visible')) {
            // Collapse: remove visible class → CSS transition runs → set display:none after.
            cardRolls.classList.remove('sr5cui-rolls-visible');
            cardRolls.addEventListener('transitionend', () => {
                if (!cardRolls.classList.contains('sr5cui-rolls-visible')) {
                    cardRolls.style.display = 'none';
                }
            }, { once: true });
        } else {
            // Expand: make element visible first, force reflow, then start transition.
            const diceRolls = cardRolls.querySelector('.dice-rolls');
            if (diceRolls) diceRolls.style.display = 'flex';
            cardRolls.style.display = 'block';
            cardRolls.getBoundingClientRect(); // force reflow so transition fires from max-height:0
            cardRolls.classList.add('sr5cui-rolls-visible');
        }
    }, true); // capture = true → fires before target/bubble phase
}

// ============================================================
// Roll card delay – hide SR5 test messages until the delay expires
// so Dice So Nice animations can finish before the result is visible.
//
// SR5 bypasses Foundry's normal roll→DSN integration (it attaches a
// dummy 0-dice roll to the ChatMessage and drives DSN manually after
// the card is already created). DSN's own "show with delay" setting
// therefore has no effect on SR5 cards. We compensate here.
//
// Uses renderChatMessageHTML (V13+) — fires for the sidebar log, the
// pop-out chat window, AND the floating notification cards.
// The legacy renderChatMessage (jQuery) is also hooked so the delay
// works even if another module happens to load it first.
// ============================================================
function sr5DelayCard(message, element) {
    const delaySec    = game.settings.get('sr5-custom-ui', 'rollCardDelay')    ?? 0;
    const durationSec = game.settings.get('sr5-custom-ui', 'rollNotifDuration') ?? 0;

    if (delaySec <= 0 && durationSec <= 0) return;

    // Only act on SR5 test result cards (flag key from SR5 source: FLAGS.Test = "TestData").
    if (!message.getFlag('shadowrun5e', 'TestData')) return;

    // Skip messages older than (delay + 15 s) so chat history on page
    // reload or log re-renders isn't hidden again.
    const ageMs = Date.now() - message.timestamp;
    if (ageMs > (delaySec * 1000 + 15000)) return;

    // Remaining wait — accounts for hook firing slightly after message creation.
    const remainingMs = Math.max(0, delaySec * 1000 - ageMs);

    // element may be HTMLElement (renderChatMessageHTML) or jQuery (legacy hook).
    // Normalise to a single HTMLElement so we control visibility directly.
    const el = element instanceof HTMLElement ? element : element[0];
    if (!el) return;

    // Hide during the delay period.
    if (remainingMs > 0) {
        // Override visibility with inline style so we beat Foundry's own
        // hidden-attribute logic (used by the notifications panel).
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('transition', 'opacity 0.3s ease', 'important');
    }

    // ── Notification lifespan control ────────────────────────────────────────
    // Foundry sets element._lifeSpan = 0 on notification cards ~100 ms after
    // renderHTML() returns (after a spacer animation).  We wait 200 ms for that
    // to happen, then take over the countdown:
    //   • During the delay  → reset _lifeSpan to 0 every 400 ms so Foundry
    //     doesn't dismiss the card while it is still hidden.
    //   • After reveal      → count down the remaining durationSec seconds,
    //     then let Foundry's ticker carry it to NOTIFY_DURATION and dismiss it.
    // Non-notification elements (sidebar, pop-out) never have _lifeSpan set, so
    // the guard `'_lifeSpan' in el` keeps this code inert for them.
    const revealAt = Date.now() + remainingMs;
    setTimeout(() => {
        if (!('_lifeSpan' in el) || !el.isConnected) return;
        const NOTIFY_DURATION = ui?.chat?.constructor?.NOTIFY_DURATION ?? 5000;
        // How long from reveal to dismissal.  0 = keep Foundry's default window.
        const showMs  = durationSec > 0 ? durationSec * 1000 : NOTIFY_DURATION;
        const expireAt = revealAt + showMs;
        el._lifeSpan = 0;
        const keepAlive = setInterval(() => {
            if (!el.isConnected) { clearInterval(keepAlive); return; }
            const remaining = expireAt - Date.now();
            if (remaining <= NOTIFY_DURATION) {
                // Close enough to the end — hand back to Foundry's ticker.
                clearInterval(keepAlive);
                el._lifeSpan = Math.max(0, NOTIFY_DURATION - remaining);
            } else {
                el._lifeSpan = 0; // keep alive
            }
        }, 400);
    }, 200); // wait for Foundry to initialise _lifeSpan

    // ── Reveal the card after the delay ──────────────────────────────────────
    setTimeout(() => {
        el.style.removeProperty('visibility');
        if (remainingMs > 0) {
            // Fade in after the delay.
            el.style.setProperty('opacity', '0', 'important');
            requestAnimationFrame(() => {
                el.style.setProperty('opacity', '1', 'important');
                setTimeout(() => el.style.removeProperty('opacity'), 350);
            });
        } else {
            el.style.removeProperty('opacity');
        }
    }, remainingMs);
}

// ─── V13 compatibility: re-inject SR5 die button into #roll-privacy ────────────
// The SR5 system injects its die button (id="sr5e-success-test-button-prompt")
// into #roll-privacy via renderChatLog.  In Foundry V13, the chat controls can
// be moved between the sidebar and the notifications panel (renderChatInput fires
// on each move).  If the SR5 renderChatLog hook ran before #roll-privacy existed,
// the button is missing; we inject it here as a fallback.
Hooks.on('renderChatInput', (_app, elements) => {
    const rollPrivacy = elements['#roll-privacy'] ?? document.getElementById('roll-privacy');
    if (!rollPrivacy) return;

    // Check THIS container only — not document.getElementById, which finds the OLD
    // sidebar's button while it is still in the DOM during a re-render cycle, causing
    // the guard to fire too early and leaving the new #roll-privacy without the button.
    if (rollPrivacy.querySelector('#sr5e-success-test-button-prompt')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id   = 'sr5e-success-test-button-prompt';
    button.setAttribute('data-tooltip', 'SR5.Tests.SuccessTest');
    button.setAttribute('aria-label', 'SR5.Tests.SuccessTest');
    button.className = 'ui-control icon';
    button.innerHTML = '<i class="fas fa-dice"></i>';
    button.addEventListener('click', () => game.shadowrun5e?.test?.promptSuccessTest());
    rollPrivacy.prepend(button);
});

// V13 non-deprecated hook – HTMLElement argument.
Hooks.on('renderChatMessageHTML', (message, element, _data) => {
    sr5DelayCard(message, element);
    // Code toggle and show-roll override are layout features — only activate when
    // Custom Layout & Sizes is ON.  Without it, SR5's native jQuery slideDown runs
    // unimpeded and .card-rolls has no CSS max-height constraint.
    if (game.settings.get('sr5-custom-ui', 'useCustomLayout')) {
        setupCodeToggle();
        setupShowRollToggle();
    }
});

// Legacy hook – jQuery argument; only active if something else already
// registered it (Foundry only fires it conditionally in V13).
Hooks.on('renderChatMessage', (message, html, _data) => {
    sr5DelayCard(message, html);
    if (game.settings.get('sr5-custom-ui', 'useCustomLayout')) {
        setupCodeToggle();
        setupShowRollToggle();
    }
});


Hooks.on('renderTestDialog', (app, html, _data) => {
    // SR5 0.36+ assigns a per-instance window id ("test-dialog-<id>") instead of the
    // previous static "test-dialog-v2", which breaks every #test-dialog-v2 CSS rule
    // (layout, roll-mode buttons, steppers). Restore the static id so that CSS still applies.
    html.id = 'test-dialog-v2';

    const useRollBtns = game.settings.get('sr5-custom-ui', 'useRollButtons');
    const useSteppers = game.settings.get('sr5-custom-ui', 'useCustomLayout');

    if (!useRollBtns && !useSteppers) return;

    // In ApplicationV2 (0.34.2+), the hook receives an HTMLElement, not jQuery.
    // Wrap once and use $html throughout — it covers the full window including footer.
    const $html = $(html);

    if (useRollBtns) {
        // --- 1. Hide the roll-mode controls (works for both old <select> and new split-button) ---
        // The module's HBS override removes these entirely, but if the system template is used
        // instead (template-cache race), we hide them here so they don't crowd our roll buttons.
        $html.find('select[name="test.data.options.rollMode"]').closest('.form-group').addClass('sr5cui-hidden');
        $html.find('.roll-mode-controls').closest('.form-group').addClass('sr5cui-hidden');
    }

    if (useSteppers) {
        // --- 1b. Wrap every number input with - / + stepper buttons ---
        // Pool gets the same wrapper/buttons but they are hidden (visibility:hidden)
        // so its width stays consistent with the other stepper inputs.
        // Disabled inputs (e.g. Drain Value) also get the ghost wrapper so they
        // share the same layout/width as active stepper inputs — buttons are invisible.
        $html.find('input[type="number"]').each(function () {
            const $input = $(this);
            // Skip if already wrapped (re-render guard)
            if ($input.parent().hasClass('sr5cui-stepper')) return;

            const isDisabled = $input.is('[disabled]');
            const isGhost    = isDisabled;

            const $dec = $('<button type="button" class="sr5cui-stepper-btn sr5cui-stepper-dec"><i class="fas fa-minus"></i></button>');
            const $inc = $('<button type="button" class="sr5cui-stepper-btn sr5cui-stepper-inc"><i class="fas fa-plus"></i></button>');

            $input.wrap(`<div class="sr5cui-stepper${isGhost ? ' sr5cui-stepper--ghost' : ''}"></div>`);
            $input.before($dec);
            $input.after($inc);

            if (!isGhost) {
                $dec.on('click', () => {
                    const step = Number($input.attr('step') ?? 1);
                    $input.val(Number($input.val()) - step);
                    $input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
                $inc.on('click', () => {
                    const step = Number($input.attr('step') ?? 1);
                    $input.val(Number($input.val()) + step);
                    $input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        });
    }

    if (!useRollBtns) return;

    // --- 2. ApplicationV2 footer uses data-action="roll" / data-action="cancel" ---
    // (Old Dialog used data-button="roll" and .dialog-buttons container.)

    // Hide the built-in Roll button.
    $html.find('[data-action="roll"]').addClass('sr5cui-hidden');

    // Remove any buttons from a previous render cycle before re-injecting.
    $html.find('.sr5cui-roll-buttons').remove();

    // --- 3. Build the four roll-mode buttons and insert before the Cancel button ---
    const $footer = $html.find('[data-application-part="footer"]');
    const wrapper = $('<div class="sr5cui-roll-buttons"></div>');

    for (const key of ROLL_MODE_ORDER) {
        const modeData = CONFIG.Dice.rollModes[key];
        if (!modeData) continue;

        const label = game.i18n.localize(modeData.label);
        const icon  = ROLL_MODE_ICONS[key] ?? 'fas fa-dice';

        const btn = $(
            `<button class="sr5cui-roll-btn sr5cui-roll-btn--${key}"
                     type="button"
                     data-roll-mode="${key}"
                     data-tooltip="${label}">
                <i class="${icon}"></i>
            </button>`
        );

        btn.on('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            // Replicate what TestDialog's internal static #roll action does:
            // 1. Mark the selected button so isFormDisabled() returns false.
            app.selectedButton = 'roll';
            // 2. Flush current form values into app.test (pool modifiers, etc.).
            app.applyFormData();
            // 3. Apply our chosen roll mode AFTER applyFormData so it isn't overwritten.
            foundry.utils.setProperty(app.test, 'data.options.rollMode', key);
            // 4. Store and resolve the selection promise so the caller gets test.data.
            app.selection = app.test.data;
            if (!app._selectionSettled) {
                app._selectionSettled = true;
                app._selectionResolve(app.selection);
            }
            // 5. Close the dialog (same as what #roll does after resolving).
            await app.close();
        });

        wrapper.append(btn);
    }

    // Insert the four buttons before the cancel button (or append to footer).
    const cancelBtn = $footer.find('[data-action="cancel"]');
    if (cancelBtn.length) {
        wrapper.insertBefore(cancelBtn);
    } else {
        $footer.append(wrapper);
    }

    // Apply per-scheme background image directly as inline style — CSS alone cannot
    // reliably override Foundry's own inline style on .window-content.
    const schemeId  = game.settings.get('sr5-custom-ui', 'colorScheme');
    const winContent = html.querySelector('.window-content');
    if (winContent) {
        if (schemeId !== 'default') {
            const root    = document.documentElement;
            const overlay = getComputedStyle(root).getPropertyValue('--sr5cui-bg-overlay').trim();
            const image   = getComputedStyle(root).getPropertyValue('--sr5cui-bg-image').trim();
            const bgValue = [overlay, image].filter(Boolean).join(', ');
            winContent.style.background       = bgValue;
            winContent.style.backgroundSize   = 'auto';
            winContent.style.backgroundRepeat = 'repeat';
            winContent.style.backgroundPosition = '';
        } else {
            winContent.style.background         = '';
            winContent.style.backgroundSize     = '';
            winContent.style.backgroundRepeat   = '';
            winContent.style.backgroundPosition = '';
        }
    }

    // On first render: auto-size, freeze the result, and track user resizing.
    // On re-renders (checkbox changes etc): restore the frozen size so the
    // dialog never jumps width or height unexpectedly.
    if (!app._sr5cuiFrozenSize) {
        app.setPosition({ height: 'auto', width: 250 });
        app._sr5cuiFrozenSize = {
            width:  html.offsetWidth,
            height: html.offsetHeight,
        };
        // Keep frozen size in sync when the user manually resizes the dialog.
        new ResizeObserver(() => {
            app._sr5cuiFrozenSize = {
                width:  html.offsetWidth,
                height: html.offsetHeight,
            };
        }).observe(html);
    } else {
        app.setPosition({ height: app._sr5cuiFrozenSize.height, width: app._sr5cuiFrozenSize.width });
    }
});


// ─── Roll-mode detection from ChatMessage ────────────────────────────────────
// Foundry V13 stores whisper/blind on ChatMessage but NOT rollMode.
// applyRollMode() set those fields at creation time, so we reverse the mapping.
function _getRollMode(message) {
    if (message.blind) return 'blindroll';
    const whisper = message.whisper ?? [];
    if (whisper.length === 0) return 'publicroll';
    // selfroll: every whisper recipient is the message author themselves
    if (whisper.every(id => id === message.author?.id)) return 'selfroll';
    return 'gmroll';
}

// ─── Inline background helper: enables DevTools gradient editing ─────────────
// SR5 actor/item sheets and journal windows get their background from a CSS
// var() rule, which DevTools cannot open a gradient picker for.  Applying the
// resolved values as inline styles makes them appear in element.style — where
// DevTools DOES show an editable gradient picker.
function _stampWindowBackground(el) {
    const schemeId = game.settings?.get?.('sr5-custom-ui', 'colorScheme');
    const clear = !schemeId || schemeId === 'default';

    const targets = [el];
    const winContent = el.querySelector?.('.window-content');
    if (winContent) targets.push(winContent);

    if (clear) {
        for (const t of targets) {
            t.style.background       = '';
            t.style.backgroundSize   = '';
            t.style.backgroundRepeat = '';
        }
        return;
    }
    const root    = document.documentElement;
    const overlay = getComputedStyle(root).getPropertyValue('--sr5cui-bg-overlay').trim();
    const image   = getComputedStyle(root).getPropertyValue('--sr5cui-bg-image').trim();
    const bg = [overlay, image].filter(Boolean).join(', ');
    if (!bg) return;
    for (const target of targets) {
        target.style.background       = bg;
        target.style.backgroundSize   = 'auto';
        target.style.backgroundRepeat = 'repeat';
    }
}

// Stamp inline backgrounds whenever any .sr5v2 or .journal-sheet window appears.
//
// `renderApplication` is ApplicationV1-only; ApplicationV2 (all V13 SR5 sheets)
// fires render<ClassName> instead.  Rather than listing every possible class name,
// we watch the DOM with MutationObserver — reliable for any app framework version.
//
// Chat cards (.sr5.chat-card) live inside the chat log, not in #ui-windows, so they
// are handled in the existing renderChatMessageHTML hook below.
Hooks.on('ready', () => {
    function stampIfNeeded(el) {
        if (!(el instanceof HTMLElement)) return;
        if (el.classList.contains('sr5v2') || el.classList.contains('journal-sheet')) {
            _stampWindowBackground(el);
        }
        // Also scan children in case a full sub-tree was inserted at once.
        for (const child of el.querySelectorAll('.sr5v2, .journal-sheet')) {
            _stampWindowBackground(child);
        }
    }

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                stampIfNeeded(node);
            }
        }
    });
    // Watch the whole document body so pop-outs and any container are covered.
    observer.observe(document.body, { childList: true, subtree: true });

    // ── Collapse / Expand all inventory sections ──────────────────────────────
    // The SR5 system template renders these two data-action links but never
    // registers handlers for them in its ApplicationV2 actions map.
    // We intercept them here and call the system's own _setInventoryVisibility().
    document.addEventListener('click', (event) => {
        const btn = event.target.closest(
            '[data-action="collapseAllInventories"], [data-action="expandAllInventories"]'
        );
        if (!btn) return;
        event.preventDefault();
        event.stopPropagation();

        const isOpen = btn.dataset.action === 'expandAllInventories';

        // Find the ApplicationV2 instance whose element contains this button.
        let app = null;
        for (const instance of (foundry.applications?.instances?.values() ?? [])) {
            if (instance.element?.contains(btn)) { app = instance; break; }
        }
        if (!app || typeof app._setInventoryVisibility !== 'function') return;

        app._setInventoryVisibility(isOpen);
        void app.render();
    }, true); // capture phase – runs before other listeners on the same element
});

// ─── Initiative formula reformatter ──────────────────────────────────────────
// Turns:  max(6[Base] + 1d6[Dice] - 0[Wounds] - 0[Pass],0)
// Into:   Base: 6 + 1d6               (wounds = 0)
//         Base: 6 + 1d6 - 2[Wounds]   (wounds > 0)
function _reformatInitiativeFormulas(el) {
    el.querySelectorAll('.dice-formula').forEach(formulaEl => {
        const text = formulaEl.textContent.trim();
        const m = text.match(
            /^max\((\d+)\[Base\]\s*\+\s*(\d+d6)\[Dice\]\s*-\s*(\d+)\[Wounds\]\s*-\s*\d+\[Pass\],\s*0\)$/
        );
        if (!m) return;
        const [, base, dice, wounds] = m;
        let out = `Base: ${base} + ${dice}`;
        if (Number(wounds) > 0) out += ` - ${wounds}[Wounds]`;
        formulaEl.textContent = out;
    });
}

// Tracks which message IDs should have their SR5 dice visible.
// Persists across re-renders (e.g. Dice So Nice triggers message.update() after
// animation, causing Foundry to replace the element wholesale via #rerenderMessage).
const _accordionDiceShown = new Set();

// Tracks which initiative summary messages should show their message-content.
// We keep this separate from dice accordion state because initiative rows are
// regular chat-message content blocks toggled via the message header.
const _initiativeContentShown = new Set();
const _normalContentShown = new Set();
const _initiativeTurnByMessageId = new Map();

function _getChatMessageRoot(el) {
    if (!el) return null;
    if (el.classList?.contains('chat-message')) return el;
    return el.closest?.('.chat-message') ?? el.querySelector?.('.chat-message') ?? null;
}

function _isInitiativeSummaryMessage(message, messageRoot) {
    const byFlag = message?.getFlag?.('core', 'initiativeRoll') === true;
    const byDom  = !!messageRoot?.querySelector?.('.initiative-summary-card');
    return byFlag || byDom;
}

function _isInitiativeModeUpdateMessage(message, senderText) {
    const title = String(message?.name ?? message?.flags?.core?.name ?? '').trim();
    const normalized = `${senderText} ${title}`.toLowerCase();
    return normalized.includes('initiative mode updated');
}

function _stampInitiativeTurn(messageRoot, messageId = null, message = null) {
    if (!messageRoot) return;

    const sender = messageRoot.querySelector?.('.message-header .message-sender');
    if (!sender) return;

    const text = sender.textContent?.trim() ?? '';
    if (!text.includes('Initiative')) return;
    if (_isInitiativeModeUpdateMessage(message, text)) return;

    const resolvedId = messageId ?? messageRoot.dataset.messageId;
    if (!resolvedId) return;

    if (_initiativeTurnByMessageId.has(resolvedId)) {
        const existing = sender.querySelector('.sr5cui-initiative-turn');
        const turnValue = _initiativeTurnByMessageId.get(resolvedId);
        if (existing) {
            existing.textContent = ` (T:${turnValue})`;
        } else {
            sender.insertAdjacentHTML('beforeend', `<span class="sr5cui-initiative-turn"> (T:${turnValue})</span>`);
        }
        return;
    }

    const combat = game.combat;
    const turnValue = Number.isInteger(combat?.round)
        ? Math.max(1, combat.round)
        : (Number.isInteger(combat?.turn) ? combat.turn + 1 : null);
    if (turnValue == null) return;

    _initiativeTurnByMessageId.set(resolvedId, turnValue);
    const existing = sender.querySelector('.sr5cui-initiative-turn');
    const label = ` (T:${turnValue})`;
    if (existing) {
        existing.textContent = label;
        return;
    }

    sender.insertAdjacentHTML('beforeend', `<span class="sr5cui-initiative-turn">${label}</span>`);
}

function _setMessageContentVisible(messageRoot, visible, collapsedClass) {
    const content = messageRoot?.querySelector?.('.message-content');
    if (!content) return;
    content.style.display = visible ? '' : 'none';
    messageRoot.classList.toggle(collapsedClass, !visible);
}

function _stripTimestampSeconds(messageRoot) {
    const tsEl = messageRoot?.querySelector?.(
        '.message-metadata .message-timestamp, .message-metadata .timestamp, .message-metadata time'
    );
    if (!tsEl) return;

    const raw = tsEl.textContent?.trim();
    if (!raw) return;

    // 12-hour clock: 1:23:45 PM -> 1:23 PM
    let next = raw.replace(/(\b\d{1,2}:\d{2}):\d{2}(\s*[AP]M\b)/i, '$1$2');
    // 24-hour clock: 13:23:45 -> 13:23
    next = next.replace(/(\b\d{1,2}:\d{2}):\d{2}\b/, '$1');
    // Relative timestamps: "x seconds ago" -> "1 min ago"
    next = next.replace(/\b\d+\s+seconds?\s+ago\b/i, '1 min ago');
    next = next.replace(/\ba\s+few\s+seconds\s+ago\b/i, '1 min ago');
    next = next.replace(/\bjust\s+now\b/i, '1 min ago');

    if (next !== raw) tsEl.textContent = next;
}

function _stripTimestampSecondsAll() {
    document.querySelectorAll('.chat-message').forEach(root => _stripTimestampSeconds(root));
}

let _timestampSanitizerReady = false;
function setupTimestampSanitizer() {
    if (_timestampSanitizerReady) return;
    _timestampSanitizerReady = true;

    // Foundry refreshes relative timestamps over time; keep them normalized.
    setInterval(_stripTimestampSecondsAll, 30000);
}

let _collapsibleHeaderToggleReady = false;
function setupCollapsibleMessageHeaderToggle() {
    if (_collapsibleHeaderToggleReady) return;
    _collapsibleHeaderToggleReady = true;

    // Capture phase lets us react before other handlers that might be attached to header.
    document.addEventListener('click', event => {
        const header = event.target.closest(
            '.chat-message[data-sr5cui-collapsible="1"] .message-header'
        );
        if (!header) return;

        // Do not hijack clicks meant for interactive header controls.
        if (event.target.closest('a, button, input, select, textarea, label')) return;

        const messageRoot = header.closest('.chat-message[data-sr5cui-collapsible="1"]');
        if (!messageRoot) return;

        const messageId = messageRoot.dataset.messageId;
        if (!messageId) return;

        const isInitiative = messageRoot.dataset.sr5cuiInitiative === '1';
        const shownSet = isInitiative ? _initiativeContentShown : _normalContentShown;
        const collapsedClass = isInitiative
            ? 'sr5cui-initiative-collapsed'
            : 'sr5cui-normal-collapsed';

        const currentlyVisible = shownSet.has(messageId);
        if (currentlyVisible) shownSet.delete(messageId);
        else shownSet.add(messageId);

        _setMessageContentVisible(messageRoot, !currentlyVisible, collapsedClass);
    }, true);
}

// Stamp chat cards (.sr5.chat-card) when they render, add roll-mode class,
// and inject the roll-mode icon next to the speaker name.
Hooks.on('renderChatMessageHTML', (message, element, _data) => {
    const el = element instanceof HTMLElement ? element : (element[0] ?? null);
    if (!el) return;

    const messageRoot = _getChatMessageRoot(el);
    setupTimestampSanitizer();
    if (messageRoot) _stripTimestampSeconds(messageRoot);

    const isInitiativeSummary = _isInitiativeSummaryMessage(message, messageRoot);

    const isNormalMessage = !!messageRoot
        && !isInitiativeSummary
        && !messageRoot.querySelector('.sr5.chat-card');

    if ((isInitiativeSummary || isNormalMessage) && messageRoot) {
        setupCollapsibleMessageHeaderToggle();
        messageRoot.dataset.sr5cuiCollapsible = '1';
    }

    if (isInitiativeSummary && messageRoot) {
        messageRoot.dataset.sr5cuiInitiative = '1';
        _stampInitiativeTurn(messageRoot, message?.id, message);

        const isNewMessage = !document.querySelector(
            `.chat-message[data-message-id="${message.id}"]`
        );

        if (!game.ready) {
            // History load: keep default behavior (visible) and track as shown.
            _initiativeContentShown.add(message.id);
        } else if (isNewMessage) {
            // New initiative message: collapse only older initiative messages.
            document.querySelectorAll('.chat-message[data-sr5cui-initiative="1"]').forEach(otherMsg => {
                const otherId = otherMsg.dataset.messageId;
                if (!otherId || otherId === message.id) return;
                _initiativeContentShown.delete(otherId);
                _setMessageContentVisible(otherMsg, false, 'sr5cui-initiative-collapsed');
            });
            _initiativeContentShown.add(message.id);
        } else if (!_initiativeContentShown.has(message.id)) {
            // Re-render: preserve whichever state is currently on-screen.
            const content = messageRoot.querySelector('.message-content');
            const isHidden = !!content && getComputedStyle(content).display === 'none';
            if (!isHidden) _initiativeContentShown.add(message.id);
        }

        // renderChatMessageHTML fires before DOM insertion; apply state after insertion.
        const messageRootRef = messageRoot;
        setTimeout(() => {
            if (!messageRootRef.isConnected) return;
            const shouldShow = _initiativeContentShown.has(message.id);
            _setMessageContentVisible(messageRootRef, shouldShow, 'sr5cui-initiative-collapsed');
        }, 0);
    }

    if (isNormalMessage && messageRoot) {
        messageRoot.dataset.sr5cuiNormal = '1';

        const isNewMessage = !document.querySelector(
            `.chat-message[data-message-id="${message.id}"]`
        );

        if (!game.ready) {
            // History load: leave visible by default.
            _normalContentShown.add(message.id);
        } else if (isNewMessage) {
            // New message: collapse all older normal chat messages.
            document.querySelectorAll('.chat-message[data-sr5cui-normal="1"]').forEach(otherMsg => {
                const otherId = otherMsg.dataset.messageId;
                if (!otherId || otherId === message.id) return;
                _normalContentShown.delete(otherId);
                _setMessageContentVisible(otherMsg, false, 'sr5cui-normal-collapsed');
            });
            _normalContentShown.add(message.id);
        } else if (!_normalContentShown.has(message.id)) {
            // Re-render: preserve whichever state is currently on-screen.
            const content = messageRoot.querySelector('.message-content');
            const isHidden = !!content && getComputedStyle(content).display === 'none';
            if (!isHidden) _normalContentShown.add(message.id);
        }

        // Apply state post-insertion.
        const messageRootRef = messageRoot;
        setTimeout(() => {
            if (!messageRootRef.isConnected) return;
            const shouldShow = _normalContentShown.has(message.id);
            _setMessageContentVisible(messageRootRef, shouldShow, 'sr5cui-normal-collapsed');
        }, 0);
    }

    const useLayout = game.settings.get('sr5-custom-ui', 'useCustomLayout');

    // Formula reformat is a layout change — only run when Custom Layout is on.
    if (useLayout) _reformatInitiativeFormulas(el);

    const card = el.classList.contains('sr5') && el.classList.contains('chat-card')
        ? el
        : el.querySelector('.sr5.chat-card');

    // ── Accordion ─────────────────────────────────────────────────────────
    // Runs for EVERY message type (SR5 tests, Foundry rolls, plain text) so
    // any new message triggers the collapse of old SR5 cards.
    //
    // game.ready is false while history messages are rendered on load;
    // true only for genuinely new messages.
    //
    // renderChatMessageHTML fires BEFORE the element is appended to the DOM,
    // so document.querySelectorAll('.sr5.chat-card') never includes the new
    // card — no skip logic needed, and modifying `card` here is pre-insertion.
    //
    // Re-render guard: if the message element already exists in the DOM this
    // is an update/re-render, not a new message — skip the accordion.
    if (game.ready && game.settings.get('sr5-custom-ui', 'diceAccordion')) {
        const isNewMessage = !document.querySelector(
            `.chat-message[data-message-id="${message.id}"]`
        );
        if (isNewMessage) {
            // Auto-expand Foundry native dice tooltip.
            // Foundry V13 collapses .dice-tooltip via grid-template-rows: 0fr on
            // .dice-roll, and expands it by adding the .expanded class to .dice-roll.
            el.querySelectorAll('.dice-roll').forEach(dr => dr.classList.add('expanded'));

            // Mark this message's SR5 dice as "should be shown".
            if (card) _accordionDiceShown.add(message.id);

            // Collapse all SR5 cards currently in the DOM and remove them from tracking.
            // Reset .dice-rolls to display:none first so SR5 will slide it open
            // (not closed) when .show-roll is clicked after re-opening .card-rolls.
            document.querySelectorAll('.sr5.chat-card').forEach(otherCard => {
                const msgEl = otherCard.closest('[data-message-id]');
                if (msgEl) _accordionDiceShown.delete(msgEl.dataset.messageId);
                const diceRolls = otherCard.querySelector('.dice-rolls');
                if (diceRolls) $(diceRolls).stop(true, true).css('display', 'none');
                const rolls = otherCard.querySelector('.card-rolls');
                if (rolls) {
                    // Remove sr5cui-rolls-visible so the CSS max-height transition
                    // collapses the panel when Custom Layout is active (no-op otherwise).
                    rolls.classList.remove('sr5cui-rolls-visible');
                    $(rolls).stop(true, true).slideUp(200);
                }

                // Collapse custom metrics section (if opened by code-row toggle).
                const metrics = otherCard.querySelector('.card-content--metrics');
                if (metrics) metrics.classList.add('sr5cui-metrics-hidden');
                otherCard
                    .querySelectorAll('.card-content--code.sr5cui-metrics-open')
                    .forEach(code => code.classList.remove('sr5cui-metrics-open'));

                // Collapse card description section if it is currently shown.
                const description = otherCard.querySelector('.card-description');
                if (description) $(description).stop(true, true).slideUp(200);
            });

            // Collapse all Foundry native roll messages currently in the DOM.
            // Removing .expanded triggers the CSS grid-template-rows transition.
            document.querySelectorAll('.chat-message .dice-roll.expanded').forEach(dr => {
                dr.classList.remove('expanded');
            });
        }

        // On EVERY render (new or re-render): reapply dice-shown state for tracked messages.
        // renderChatMessageHTML fires BEFORE the element is inserted into the DOM, so
        // defer via setTimeout(0) to run after insertion — direct style assignment then
        // reliably overrides the CSS default of display:none on .card-rolls / .dice-rolls.
        if (card && _accordionDiceShown.has(message.id)) {
            const cardRef = card;
            setTimeout(() => {
                if (!cardRef.isConnected) return;
                const cardRolls = cardRef.querySelector('.card-rolls');
                const diceRolls = cardRef.querySelector('.dice-rolls');
                if (cardRolls) {
                    cardRolls.style.display = 'block';
                    // Also add the CSS class so the max-height transition lifts
                    // when Custom Layout is active; no-op without the layout gate.
                    cardRolls.classList.add('sr5cui-rolls-visible');
                }
                if (diceRolls) diceRolls.style.display = 'flex';
                // Scroll to bottom so the expanded dice aren't clipped by the log viewport.
                ui.chat?.scrollBottom?.();
            }, 0);
        }
    }

    if (!card) return;

    // ── Roll-mode class ────────────────────────────────────────────────────
    const rollMode = _getRollMode(message);
    card.classList.remove('sr5cui-mode-publicroll', 'sr5cui-mode-gmroll',
                          'sr5cui-mode-blindroll',  'sr5cui-mode-selfroll');
    card.classList.add(`sr5cui-mode-${rollMode}`);

    // ── Strip show-description clickability when description has no visible content ──
    // Gated behind Custom Layout: the sr5cui-no-description CSS that styles the
    // result is also layout-gated, so don't mutate the DOM when layout is off.
    if (useLayout) {
        // description.description.value may be an empty ProseMirror string ("<p></p>")
        // which is truthy in Handlebars, so the card-description div is rendered but
        // visually empty.
        card.querySelectorAll('.card-content.show-description').forEach(showDiv => {
            const descDiv = showDiv.nextElementSibling;
            if (!descDiv || !descDiv.classList.contains('card-description')) return;
            const hasText = descDiv.textContent.trim().length > 0;
            const hasImg  = descDiv.querySelector('img, figure') !== null;
            if (!hasText && !hasImg) {
                showDiv.classList.remove('clickable', 'show-description');
                showDiv.classList.add('sr5cui-no-description');
                descDiv.style.display = 'none';
            }
        });
    }

    // ── Roll-mode icon in the message-header sender ────────────────────────
    // Skip if already injected (re-render guard) or if the default SR5 scheme is active.
    const scheme = game.settings?.get?.('sr5-custom-ui', 'colorScheme');
    if (!scheme || scheme === 'default') return;
    if (el.querySelector('.sr5cui-roll-icon')) return;

    const iconClass = ROLL_MODE_ICONS[rollMode] ?? 'fas fa-dice';
    const label = game.i18n.localize(CONFIG.Dice?.rollModes?.[rollMode]?.label ?? rollMode);

    // Inject into the .message-sender inside the Foundry message-header (outside the card).
    const messageSender = el.querySelector('.message-header .message-sender');
    if (messageSender) {
        messageSender.insertAdjacentHTML(
            'afterbegin',
            `<i class="${iconClass} sr5cui-roll-icon" data-tooltip="${label}"></i> `
        );
    }
});

// ─── Custom SVG icons for SR5 edit-mode toggle ──────────────────────────────
// Replaces SR5's built-in FontAwesome icons on the toggleEditMode button with
// our own SVG images, and inserts a static wrench button to its left.
// SR5's internal icon <i> elements are hidden but kept in DOM so SR5 can
// continue to update their classes — which our :has() CSS and isEditMode
// detection below both rely on.
const SR5CUI_ICON_PATH = 'modules/sr5-custom-ui/assets/';

function _applyCustomHeaderIcons(app, element) {
    if (!element.classList.contains('sr5v2')) return;

    const toggleBtn = element.querySelector('button[data-action="toggleEditMode"]');
    if (!toggleBtn) return;

    // Hide SR5's FA <i> elements — keep in DOM for SR5 class updates and :has() detection.
    for (const i of toggleBtn.querySelectorAll('i')) {
        i.style.display = 'none';
    }

    // Remove elements injected in any previous render cycle.
    element.querySelector('.sr5cui-wrench-btn')?.remove();
    toggleBtn.querySelectorAll('.sr5cui-edit-toggle-img').forEach(img => img.remove());

    // Determine current mode: prefer the app property, fall back to icon class.
    const isEdit = typeof app.isEditMode === 'boolean'
        ? app.isEditMode
        : !!toggleBtn.querySelector('.fa-toggle-large-off');

    // Insert edit toggle image inside the existing toggle button.
    const toggleImg = document.createElement('img');
    toggleImg.className = 'sr5cui-edit-toggle-img';
    toggleImg.src = `${SR5CUI_ICON_PATH}${isEdit ? 'icon-edit-on.svg' : 'icon-edit-off.svg'}`;
    toggleImg.alt = '';
    toggleBtn.appendChild(toggleImg);

    // Insert static wrench button immediately to the left of the toggle button.
    const wrenchBtn = document.createElement('button');
    wrenchBtn.type = 'button';
    wrenchBtn.className = 'header-control icon sr5cui-wrench-btn';
    wrenchBtn.tabIndex = -1;
    const wrenchImg = document.createElement('img');
    wrenchImg.className = 'sr5cui-wrench-img';
    wrenchImg.src = `${SR5CUI_ICON_PATH}icon-wrench.svg`;
    wrenchImg.alt = '';
    wrenchBtn.appendChild(wrenchImg);
    toggleBtn.insertAdjacentElement('beforebegin', wrenchBtn);
}

Hooks.on('renderApplicationV2', (app, element) => {
    _applyCustomHeaderIcons(app, element);
    _applyMatrixOfflineVisibility(element);
});

// ─── Hide network icon rows with no network (i.e. "Offline") from players ───
// Toggled via the hideMatrixOfflineRows setting; scope defaults to any open
// .sr5v2 sheet(s) when called from the setting's onChange (no reload needed).
//
function _actorIsConnectedToNetwork(sheetRoot) {
    // Haetaan teksti suoraan split-containerin sisällä olevasta list-item-headerin labelista
    const statusLabel = sheetRoot.querySelector('.split-container .list-item-header .list-item-start label');
    
    if (statusLabel) {
        // Trimmataan turhat välilyönnit ja rivinvaihdot pois tekstin ympäriltä
        const text = statusLabel.textContent?.trim() || "";
        
        // Jos teksti on tarkalleen "No Network", hahmo on takuulla OFFLINE
        if (text === "No Network" || text.includes("No Network")) {
            return false;
        }
        
        // Jos teksti on jotain muuta (esim. "Connected To: Telia"), hahmo on ONLINE
        if (text.length > 0) {
            return true;
        }
    }

    // Varmuuskopio/Kiertotie: jos jostain syystä labelia ei löytyisi, 
    // mutta tiedetään että No Network -teksti leijuu jossain tuon headerin sisällä
    const backupHeader = sheetRoot.querySelector('.split-container .list-item-header');
    if (backupHeader && backupHeader.textContent?.includes("No Network")) {
        return false;
    }

    // Jos mitään ei löytynyt, oletetaan turvallisuussyistä offline
    return false;
}

function _applyMatrixOfflineVisibility(root) {
    const hidePlayerOnly = !game.user.isGM;
    const hideOfflineRows = game.settings.get('sr5-custom-ui', 'hideMatrixOfflineRows') && hidePlayerOnly;
    const scopes = root ? [root] : document.querySelectorAll('.sr5v2');
    
    // Haetaan v14-scenen kaikki voimassa olevat tokenit kartalta
    const currentScene = canvas.scene;
    if (!currentScene) return;
    
    // Haetaan kaikki kartalla fyysisesti olevat token-oliot (Placeables)
    const allCanvasTokens = canvas.tokens.placeables;

    for (const scope of scopes) {
        // Katsotaan onko pelaaja itse verkossa
        const hideAll = hidePlayerOnly && !_actorIsConnectedToNetwork(scope);
        
        scope.querySelectorAll('#network-icons-scroll .list-item-container, #marked-icons-scroll .list-item-container').forEach(row => {
            
            // 1. TARKISTUS: Piilotetut Tokenit (Ehdotuksesi mukainen dynaaminen UUID-vertailu)
            // Etsitään row-elementin sisäpuolelta se elementti, jolla on data-uuid
            const uuidElement = row.querySelector('[data-uuid]');
            const rowUuid = uuidElement ? uuidElement.getAttribute('data-uuid') : null;
            
            let isTokenHidden = false;

            if (rowUuid) {
                // Etsitään kartalta se token, jonka actorin UUID mätsää HTML-rivin UUID:hen
                const matchedToken = allCanvasTokens.find(t => {
                    // Haetaan tokenin oman actorin virallinen uuid (tai _uuid v14-mallissa)
                    const actorUuid = t.actor?.uuid || t.actor?._uuid;
                    return actorUuid === rowUuid;
                });

                // Jos token löytyi ja se on piilotettu kartalla (GM-silmä kiinni)
                if (matchedToken) {
                    // Käytetään v14-varmistettua dokumenttitason tai löytämääsi polkua
                    if (matchedToken.document?.hidden === true || matchedToken.actor?.token?.hidden === true) {
                        isTokenHidden = true;
                    }
                }
            }

            // JOS TOKEN ON PIILOTETTU KARTALLA -> Piilotetaan rivi listalta KAIKILTA (Myös GM:ltä)
            if (isTokenHidden) {
                row.classList.toggle('sr5cui-hidden', true);
                return; // Hypätään heti seuraavaan riviin
            }

            // 2. ALKUPERÄISET SÄÄNNÖT (Vain pelaajille, jos laite on näkyvissä kartalla)
            if (hideAll) {
                row.classList.toggle('sr5cui-hidden', true);
                return;
            }
            const isOffline = row.closest('#network-icons-scroll') && !row.dataset.network?.trim();
            row.classList.toggle('sr5cui-hidden', hideOfflineRows && isOffline);
        });
    }
}

function _collapseInitiativeMessages() {
    if (!game.settings.get('sr5-custom-ui', 'diceAccordion')) return;

    document.querySelectorAll('.chat-message[data-sr5cui-initiative="1"]').forEach(messageRoot => {
        const messageId = messageRoot.dataset.messageId;
        if (messageId) _initiativeContentShown.delete(messageId);
        _setMessageContentVisible(messageRoot, false, 'sr5cui-initiative-collapsed');
    });
}

Hooks.on('updateCombat', (combat, diff) => {
    if (combat?.active === false || diff?.active === false) {
        _collapseInitiativeMessages();
    }
});

Hooks.on('deleteCombat', () => {
    _collapseInitiativeMessages();
});


