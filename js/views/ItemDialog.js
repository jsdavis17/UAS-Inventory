import { Database } from '../data/Database.js';
import { Session } from '../services/Session.js';
import { InventoryService } from '../services/InventoryService.js';
import { Dialogs, Toaster } from '../ui/Dialogs.js';
import { $, esc, hazardBadge, formatTime } from '../utils.js';

/**
 * ItemDialog: item details, check-out form, hazard warning and confirmation.
 * Layer: Presentation. Absorbs the hazard dialog.
 * Replaces: dlgItem(), the open action, the form half of onCheckout(), openHazard(),
 * hazok, hazcancel, the ack checkbox, the dlg2 close handler, the confirmation half
 * of finishCheckout(), ui.itemId, ui.hazPending.
 * Requirements: UI-6, UI-7, FR-SF-4, FR-CO-1 to FR-CO-4.
 */
export class ItemDialog {
    /** @type {Dialogs} */
    #dialogs;
    /** @type {Toaster} */
    #toaster;
    /** @type {Database} */
    #database;
    /** @type {Session} */
    #session;
    /** @type {InventoryService} */
    #inventoryService;
    /** @type {() => void} switches to My items */
    #onGoToMyItems;
    /** @type {number | null} item shown in the dialog */
    #itemId;
    /** @type {{itemId: number, quantity: number} | null} waiting for hazard acknowledgment */
    #pendingCheckout;

    /**
     * @param {Dialogs} dialogs
     * @param {Toaster} toaster
     * @param {Database} database
     * @param {Session} session
     * @param {InventoryService} inventoryService
     * @param {() => void} onGoToMyItems
     */
    constructor(dialogs, toaster, database, session, inventoryService, onGoToMyItems) {
        this.#dialogs = dialogs;
        this.#toaster = toaster;
        this.#database = database;
        this.#session = session;
        this.#inventoryService = inventoryService;
        this.#onGoToMyItems = onGoToMyItems;
        this.#itemId = null;
        this.#pendingCheckout = null;

        // Esc, the backdrop and Cancel all close the warning, so they all end up here
        dialogs.getSecondary().addEventListener('close', () => this.cancelHazard());
    }

    /**
     * Open the dialog for an item and focus the quantity field.
     * Replaces: the open action. Tests: TC-SF-05, TC-CO-01.
     * @param {number} itemId
     */
    open(itemId) {
        this.#itemId = itemId;
        this.render();

        const q = $('#coQty');

        if (q) {
            q.focus();
            q.select();
        }
    }

    /**
     * Draw details, who holds it, and the check-out form (none when 0 available).
     * Replaces: dlgItem().
     * Requirements: FR-SF-4, FR-CO-1. Tests: TC-SF-05, TC-CO-02, TC-CO-03, TC-CO-06.
     * @param {{quantity?: string, error?: string}} [state]  value and error to keep
     */
    render(state = {}) {
        const item = this.#database.getItemById(this.#itemId);
        const a = this.#database.getAvailableQuantity(item.getId());
        const mine = this.#database.getHolding(this.#session.getCurrentUser().getId(), item.getId());
        const holders = this.#database.getHoldingsForItem(item.getId());

        const body = `
            <div>${hazardBadge(item)}${a === 0 ? ' <span class="badge b-crit">None left</span>' : ''}</div>
            <p>${esc(item.getDescription())}</p>
            <dl class="facts">
                <div><dt>Category</dt><dd>${esc(item.getCategory())}</dd></div>
                <div><dt>Storage location</dt><dd>${esc(item.getLocation())}</dd></div>
                <div><dt>Total quantity</dt><dd>${item.getTotalQuantity()}</dd></div>
                <div><dt>Available now</dt><dd>${a}</dd></div>
                <div style="grid-column:1/-1">
                    <dt>Checked out by</dt>
                    <dd>${holders.length ? holders.map(h => esc(this.#database.getUserById(h.getMemberId()).getName()) + ' ×' + h.getQuantity()).join(', ') : 'Nobody'}</dd>
                </div>
            </dl>
            ${a > 0
                ? `
                    <form class="co-box" id="coForm" novalidate>
                        <div class="co-row">
                            <div class="fld">
                                <label class="lbl" for="coQty">Quantity</label>
                                <input id="coQty" type="text" inputmode="numeric" value="${esc(state.quantity != null ? state.quantity : '1')}" ${state.error ? 'aria-invalid="true" aria-describedby="e-coQty"' : ''}>
                            </div>
                            <button class="btn btn-primary" type="submit">Check out</button>
                        </div>
                        <p class="err" id="e-coQty" role="alert">${esc(state.error || '')}</p>
                        ${item.isHazardous() ? '<p class="small muted">This item is hazardous. You will see a safety warning before the check-out finishes.</p>' : ''}
                    </form>
                `
                : '<p class="muted">Every unit is checked out right now, so check-out isn’t available.</p>'}
            ${mine
                ? `<p class="small">You hold ${mine.getQuantity()} of these. Return them from <button class="link" data-act="gomine">My items</button>.</p>`
                : ''}
        `;

        this.#dialogs.open(this.#dialogs.getPrimary(), this.#dialogs.frame(
            `${esc(item.getName())} <span class="mono small muted" style="font-weight:normal">${item.getCode()}</span>`,
            body));

        if (state.error) {
            $('#coQty').focus();
            $('#coQty').select();
        }
    }

    /**
     * Validate the quantity, then show the hazard warning or finish the check-out.
     * Replaces: the form half of onCheckout().
     * Tests: TC-CO-01, TC-CO-02, TC-CO-03, TC-CO-04.
     */
    submitCheckout() {
        const item = this.#database.getItemById(this.#itemId);
        const raw = $('#coQty').value;
        const check = this.#inventoryService.parseQuantity(raw,
            this.#database.getAvailableQuantity(item.getId()), 'available');

        if (check.error) {
            this.render({
                error: check.error,
                quantity: raw
            });
            return;
        }

        if (this.#inventoryService.requiresHazardAck(item)) {
            this.#pendingCheckout = {
                itemId: item.getId(),
                quantity: check.quantity
            };
            this.showHazardWarning(item, check.quantity);
            return;
        }

        const result = this.#inventoryService.checkOut(this.#session.getCurrentUser(),
            item.getId(), check.quantity, false);
        this.showConfirmation(result);
    }

    /**
     * Show the safety warning; the confirm button stays disabled until the box is ticked.
     * Replaces: openHazard(). Requirements: FR-CO-3, UI-6, SA.1. Tests: TC-CO-04.
     * @param {import('../models/InventoryItem.js').InventoryItem} item
     * @param {number} quantity
     */
    showHazardWarning(item, quantity) {
        const notes = this.#inventoryService.getSafetyNotes(item);

        this.#dialogs.open(this.#dialogs.getSecondary(), `
            <div class="dlg-hd haz-hd">
                <h2 id="dlg2Title">WARNING: Hazardous item</h2>
            </div>
            <div class="dlg-bd">
                <p><strong>${quantity} × ${esc(item.getName())}</strong> is flagged hazardous. Read this before you take it.</p>
                <ul class="notes">
                    ${notes.map(n => '<li>' + esc(n) + '</li>').join('')}
                </ul>
                <div class="ack-box">
                    <label class="check">
                        <input type="checkbox" id="ack">
                        <span>I have read the safety rules above and will follow them.</span>
                    </label>
                </div>
                <div class="actions">
                    <button class="btn" data-act="hazcancel">Cancel</button>
                    <button class="btn btn-warn" id="ackBtn" data-act="hazok" disabled>Acknowledge and check out</button>
                </div>
            </div>
        `);
    }

    /**
     * Enable or disable the confirm button. Replaces: the ack part of onFilter().
     * Tests: TC-CO-04.
     * @param {boolean} checked
     */
    setAcknowledged(checked) {
        $('#ackBtn').disabled = !checked;
    }

    /**
     * "Acknowledge and check out". Replaces: the hazok action. Tests: TC-CO-04.
     */
    confirmHazard() {
        const pending = this.#pendingCheckout;

        // Clear it first, so the close listener below doesn't treat this as a cancel
        this.#pendingCheckout = null;
        this.#dialogs.close(this.#dialogs.getSecondary());

        const result = this.#inventoryService.checkOut(this.#session.getCurrentUser(),
            pending.itemId, pending.quantity, true);
        this.showConfirmation(result);
    }

    /**
     * Cancel button, Esc or backdrop on the warning: drop the pending check-out and
     * show "Check-out cancelled. Nothing was changed."
     * Replaces: hazcancel and the dlg2 close handler.
     * Requirements: FR-CO-4. Tests: TC-CO-05.
     */
    cancelHazard() {
        if (this.#pendingCheckout) {
            this.#pendingCheckout = null;
            this.#toaster.show('Check-out cancelled. Nothing was changed.', 'info');
        }
    }

    /**
     * "Checked out" screen with transaction ID, time, units left, and the safety line
     * for hazardous items. Replaces: the confirmation half of finishCheckout().
     * Requirements: UI-7. Tests: TC-CO-01, TC-CO-04.
     * @param {{entry: import('../models/CheckOutHistory.js').CheckOutHistory,
     *          item: import('../models/InventoryItem.js').InventoryItem,
     *          remaining: number}} result
     */
    showConfirmation(result) {
        const entry = result.entry;
        const item = result.item;

        this.#dialogs.open(this.#dialogs.getPrimary(), this.#dialogs.frame('Checked out', `
            <div class="done">
                <p><strong>${entry.getQuantity()} × ${esc(item.getName())}</strong> is now recorded under ${esc(this.#session.getCurrentUser().getName())}.</p>
                <dl class="facts">
                    <div><dt>Transaction ID</dt><dd class="mono">${entry.getDisplayId()}</dd></div>
                    <div><dt>Time</dt><dd>${formatTime(entry.getTimestamp())}</dd></div>
                    <div><dt>Left on the shelf</dt><dd>${result.remaining} of ${item.getTotalQuantity()}</dd></div>
                    ${item.isHazardous() ? '<div><dt>Safety</dt><dd>Hazard warning acknowledged</dd></div>' : ''}
                </dl>
                <div class="actions">
                    <button class="btn" data-act="gomine">View my items</button>
                    <button class="btn btn-primary" data-act="closedlg">Done</button>
                </div>
            </div>
        `));
    }

    /**
     * Handle a click on a data-act button that belongs to this dialog
     * (hazok, hazcancel, gomine). The open action is handled by InventoryView.
     * @param {string} action
     * @param {HTMLElement} element
     * @returns {boolean} true if handled
     */
    handleAction(action, element) {
        switch (action) {
            case 'hazok':
                this.confirmHazard();
                return true;
            case 'hazcancel':
                this.#dialogs.close(this.#dialogs.getSecondary());
                return true;
            case 'gomine':
                this.#onGoToMyItems();
                return true;
            default:
                return false;
        }
    }
}
