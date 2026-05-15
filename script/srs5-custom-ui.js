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
    const SR5 = 'systems/shadowrun5e/dist/templates';
    await Promise.all([
        // Test dialog – document header (actor + item side by side)
        [`${SR5}/apps/dialogs/parts/success-test-documents.hbs`,           'success-test-documents.hbs'],
        // Test dialog
        [`${SR5}/apps/dialogs/parts/success-test-common.hbs`,          'success-test-common.hbs'],
        [`${SR5}/apps/dialogs/parts/success-test-entry.hbs`,          'success-test-entry.hbs'],
        // Test message
        [`${SR5}/rolls/success-test-message.hbs`,                       'success-test-message.hbs'],
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
    ].map(([sys, mod]) => registerTemplateOverride(sys, mod)));
});

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
    if (document.getElementById('sr5e-success-test-button-prompt')) return; // already present

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
});

// Legacy hook – jQuery argument; only active if something else already
// registered it (Foundry only fires it conditionally in V13).
Hooks.on('renderChatMessage', (message, html, _data) => {
    sr5DelayCard(message, html);
});


Hooks.on('renderTestDialog', (app, html, _data) => {
    const useRollBtns = game.settings.get('sr5-custom-ui', 'useRollButtons');
    const useSteppers = game.settings.get('sr5-custom-ui', 'useCustomLayout');

    if (!useRollBtns && !useSteppers) return;

    if (useRollBtns) {
        // --- 1. Hide the roll-mode controls (works for both old <select> and new split-button) ---
        // The module's HBS override removes these entirely, but if the system template is used
        // instead (template-cache race), we hide them here so they don't crowd our roll buttons.
        html.find('select[name="test.data.options.rollMode"]').closest('.form-group').addClass('sr5cui-hidden');
        html.find('.roll-mode-controls').closest('.form-group').addClass('sr5cui-hidden');
    }

    if (useSteppers) {
        // --- 1b. Wrap every number input with - / + stepper buttons ---
        // Pool gets the same wrapper/buttons but they are hidden (visibility:hidden)
        // so its width stays consistent with the other stepper inputs.
        // Disabled inputs (e.g. Drain Value) also get the ghost wrapper so they
        // share the same layout/width as active stepper inputs — buttons are invisible.
        html.find('input[type="number"]').each(function () {
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

    // --- 2. Use app.element (stable outer frame) for everything in .dialog-buttons ---
    // On re-renders, .dialog-buttons is a top-level sibling in `html`, so html.find('.dialog-buttons')
    // returns empty. app.element always wraps the full window as a proper DOM ancestor.
    const outerEl = app.element;

    // Hide the original Roll button.
    outerEl.find('[data-button="roll"]').addClass('sr5cui-hidden');

    // Remove any buttons from a previous render cycle before re-injecting.
    outerEl.find('.sr5cui-roll-buttons').remove();

    // --- 4. Build the four roll-mode buttons and insert before the Cancel button ---
    const btnContainer = outerEl.find('.dialog-buttons');
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

            // Set the roll mode directly on the test data so SR5 picks it up on submit.
            // The new SR5 system uses button-based roll-mode controls (no <select>);
            // setProperty mirrors what SR5's own roll-mode-button handler does.
            foundry.utils.setProperty(app.data, 'test.data.options.rollMode', key);

            // Submit via the existing roll-button data object (sets selectedButton = 'roll').
            await app.submit(app.data.buttons.roll);
        });

        wrapper.append(btn);
    }

    // Insert the four buttons before the cancel button (or prepend to the container).
    const cancelBtn = btnContainer.find('[data-button="cancel"]');
    if (cancelBtn.length) {
        wrapper.insertBefore(cancelBtn);
    } else {
        btnContainer.prepend(wrapper);
    }

    // Apply per-scheme background image directly as inline style — CSS alone cannot
    // reliably override Foundry's own inline style on .window-content.
    const schemeId  = game.settings.get('sr5-custom-ui', 'colorScheme');
    const winContent = outerEl[0].querySelector('.window-content');
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
            width:  outerEl[0].offsetWidth,
            height: outerEl[0].offsetHeight,
        };
        // Keep frozen size in sync when the user manually resizes the dialog.
        new ResizeObserver(() => {
            app._sr5cuiFrozenSize = {
                width:  outerEl[0].offsetWidth,
                height: outerEl[0].offsetHeight,
            };
        }).observe(outerEl[0]);
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

// Stamp chat cards (.sr5.chat-card) when they render, add roll-mode class,
// and inject the roll-mode icon next to the speaker name.
Hooks.on('renderChatMessageHTML', (message, element, _data) => {
    const el = element instanceof HTMLElement ? element : (element[0] ?? null);
    if (!el) return;
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

            // Auto-open the new SR5 card's dice (SR5 CSS defaults to display:none).
            if (card) {
                const newDiceRolls = card.querySelector('.dice-rolls');
                if (newDiceRolls) newDiceRolls.style.display = 'flex';
            }
            // Collapse all SR5 cards currently in the DOM.
            // Reset .dice-rolls to display:none first so SR5 will slide it open
            // (not closed) when .show-roll is clicked after re-opening .card-rolls.
            document.querySelectorAll('.sr5.chat-card').forEach(otherCard => {
                const diceRolls = otherCard.querySelector('.dice-rolls');
                if (diceRolls) $(diceRolls).stop(true, true).css('display', 'none');
                const rolls = otherCard.querySelector('.card-rolls');
                if (rolls) $(rolls).stop(true, true).slideUp(200);
            });
            // Collapse all Foundry native roll messages currently in the DOM.
            // Removing .expanded triggers the CSS grid-template-rows transition.
            document.querySelectorAll('.chat-message .dice-roll.expanded').forEach(dr => {
                dr.classList.remove('expanded');
            });
        }
    }

    if (!card) return;

    // ── Roll-mode class ────────────────────────────────────────────────────
    const rollMode = _getRollMode(message);
    card.classList.remove('sr5cui-mode-publicroll', 'sr5cui-mode-gmroll',
                          'sr5cui-mode-blindroll',  'sr5cui-mode-selfroll');
    card.classList.add(`sr5cui-mode-${rollMode}`);

    // ── Strip show-description clickability when description has no visible content ──
    // description.description.value may be an empty ProseMirror string ("<p></p>") which
    // is truthy in Handlebars, so the card-description div is rendered but visually empty.
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

    // ── Restore .card-rolls visibility when .show-roll is clicked ────────────
    // SR5's own _chatToggleCardRolls handler already animates .dice-rolls open/closed.
    // Our only job here is to instantly un-hide .card-rolls if the accordion collapsed
    // it, so SR5's .dice-rolls animation inside it is actually visible.
    // Guard against double-registration on re-renders.
    if (!card.dataset.sr5cuiRollToggle) {
        card.dataset.sr5cuiRollToggle = '1';
        card.querySelectorAll('.show-roll').forEach(showRoll => {
            showRoll.addEventListener('click', () => {
                const cardRolls = card.querySelector('.card-rolls');
                if (cardRolls && !$(cardRolls).is(':visible')) {
                    // Instant show — SR5 animates .dice-rolls inside; no double-animation.
                    $(cardRolls).show();
                }
            });
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
});


