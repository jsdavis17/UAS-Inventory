import { Database } from '../data/Database.js';
import { Session } from '../services/Session.js';
import { InventoryService } from '../services/InventoryService.js';
import { Toaster } from '../ui/Dialogs.js';
import { $, esc, hazardBadge, formatTime, showFieldError } from '../utils.js';

/**
 * MyItemsView: the member's held items, each with a return form.
 * Layer: Presentation.
 * Replaces: viewMine(), the form half of onReturn().
 * Requirements: FR-CI-1, FR-CI-2.
 */
export class MyItemsView {
    /** @type {HTMLElement} */
    #root;
    /** @type {Database} */
    #database;
    /** @type {Session} */
    #session;
    /** @type {InventoryService} */
    #inventoryService;
    /** @type {Toaster} */
    #toaster;

    /**
     * @param {HTMLElement} root
     * @param {Database} database
     * @param {Session} session
     * @param {InventoryService} inventoryService
     * @param {Toaster} toaster
     */
    constructor(root, database, session, inventoryService, toaster) {
        this.#root = root;
        this.#database = database;
        this.#session = session;
        this.#inventoryService = inventoryService;
        this.#toaster = toaster;
    }

    /**
     * List held items with quantity, check-out time and return location.
     * Replaces: viewMine(). Requirements: FR-CI-1. Tests: TC-CI-01, TC-CO-01.
     */
    render() {
        const memberId = this.#session.getCurrentUser().getId();
        const holdings = this.#database.getHoldingsForMember(memberId);

        this.#root.innerHTML = `
            <h1>My items</h1>
            <p class="lede">Items checked out under your name. You can return part of a quantity.</p>
            <div id="held"></div>
        `;

        if (!holdings.length) {
            this.renderEmpty();
            return;
        }

        $('#held').innerHTML = `
            <div class="held-list">
                ${holdings.map(h => {
                    const item = this.#database.getItemById(h.getItemId());

                    return `
                        <form class="held" data-ret="${item.getId()}" novalidate>
                            <div>
                                <h3>${esc(item.getName())} ${hazardBadge(item)}</h3>
                                <p class="meta">You hold ${h.getQuantity()} · checked out ${formatTime(h.getSince())} · return to ${esc(item.getLocation())}</p>
                            </div>
                            <div class="held-form">
                                <div class="fld">
                                    <label class="lbl" for="ret-${item.getId()}">Return</label>
                                    <input id="ret-${item.getId()}" type="text" inputmode="numeric" value="${h.getQuantity()}">
                                </div>
                                <button class="btn btn-primary" type="submit">Return</button>
                            </div>
                            <p class="err" id="e-ret-${item.getId()}" role="alert"></p>
                        </form>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * "No items checked out" panel with a Browse inventory button.
     * Requirements: UC5 exception. Tests: TC-CI-04.
     */
    renderEmpty() {
        $('#held').innerHTML = `
            <div class="panel">
                <h3>No items checked out</h3>
                <p class="muted" style="margin-top:4px">You don’t hold anything right now.</p>
                <p style="margin-top:8px">
                    <button class="btn btn-sm" data-act="tab" data-v="inventory">Browse inventory</button>
                </p>
            </div>
        `;
    }

    /**
     * Read the return quantity, call InventoryService.checkIn(), then redraw and toast.
     * Replaces: the form half of onReturn().
     * Tests: TC-CI-02, TC-CI-03, TC-CI-04.
     * @param {number} itemId
     */
    submitReturn(itemId) {
        const input = $('#ret-' + itemId);
        const result = this.#inventoryService.checkIn(this.#session.getCurrentUser(),
            itemId, input.value);

        if (result.error) {
            showFieldError('ret-' + itemId, result.error);
            input.focus();
            return;
        }

        this.render();
        this.#toaster.show('Returned ' + result.entry.getQuantity() + ' × ' +
            result.item.getName() + '. Transaction ' +
            result.entry.getDisplayId() + '.', 'ok');
    }
}
