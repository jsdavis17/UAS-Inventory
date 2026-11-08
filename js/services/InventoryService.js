import { Database } from '../data/Database.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { CheckOutHistory } from '../models/CheckOutHistory.js';
import { User } from '../models/User.js';

/**
 * InventoryService: search, quantity checks, check-out, check-in and hazard rules.
 * Layer: Business. New (takes search(), filter() and editInventory() off the UML's
 * Inventory Item, and absorbs the safety notes).
 * Replaces: filteredItems(), parseQty(), the data changes in finishCheckout() and
 * onReturn(), the hazard check in onCheckout(), CAT_NOTES, DEFAULT_NOTES.
 *
 * No method here touches the page. Each one returns a result for the view to show.
 * The member is passed in, instead of reading a global session.
 */
export class InventoryService {
    /** @type {Database} */
    #database;

    /** Safety notes by category. Move CAT_NOTES here. */
    static SAFETY_NOTES;
    /** Notes for hazardous items with no category entry. Move DEFAULT_NOTES here. */
    static DEFAULT_SAFETY_NOTES;

    /** @param {Database} database */
    constructor(database) {
    }

    /* Search and filter (UC3) */

    /**
     * Items whose name or description contains the text, in the category if one is
     * chosen, sorted by name. Replaces: filteredItems().
     * Requirements: FR-SF-1, FR-SF-2, FR-SF-3.
     * Tests: TC-SF-01, TC-SF-02, TC-SF-03, TC-SF-04.
     * @param {string} text      search text ('' for all)
     * @param {string} category  category name ('' for all)
     * @returns {InventoryItem[]}
     */
    search(text, category) {
    }

    /* Validation */

    /**
     * Check a typed quantity is a whole number from 1 to max. Replaces: parseQty().
     * Requirements: FR-CO-2, FR-CI-2. Tests: TC-CO-02, TC-CO-03, TC-CI-03.
     * @param {string} input
     * @param {number} max
     * @param {string} unitLabel  'available' or 'held', used in the error message
     * @returns {{quantity: number} | {error: string}}
     */
    parseQuantity(input, max, unitLabel) {
    }

    /* Hazard rules */

    /**
     * Requirements: FR-CO-3, SA.1. Tests: TC-CO-04, TC-CO-05.
     * @param {InventoryItem} item
     * @returns {boolean}
     */
    requiresHazardAck(item) {
    }

    /**
     * Safety notes for the hazard warning. Tests: TC-CO-04.
     * @param {InventoryItem} item
     * @returns {string[]}
     */
    getSafetyNotes(item) {
    }

    /* Check out (UC4) and check in (UC5) */

    /**
     * Validate, add or grow the member's holding, and log the transaction.
     * Refuses a hazardous item unless hazardAcknowledged is true.
     * Replaces: the data half of finishCheckout().
     * Requirements: FR-CO-2, FR-CO-5, FR-CO-6, FR-CO-8, SA.3.
     * Tests: TC-CO-01, TC-CO-04, TC-CO-06.
     * Later: notify the safety officer for hazardous items (FR-CO-7).
     * @param {User} member
     * @param {number} itemId
     * @param {number} quantity
     * @param {boolean} hazardAcknowledged
     * @returns {{entry: CheckOutHistory, item: InventoryItem, remaining: number}
     *          | {error: string}}
     */
    checkOut(member, itemId, quantity, hazardAcknowledged) {
    }

    /**
     * Validate, shrink or remove the member's holding, and log the transaction.
     * Replaces: the data half of onReturn().
     * Requirements: FR-CI-2, FR-CI-3, FR-CI-4, FR-CI-5.
     * Tests: TC-CI-02, TC-CI-03, TC-CI-04.
     * @param {User} member
     * @param {number} itemId
     * @param {number} quantity
     * @returns {{entry: CheckOutHistory, item: InventoryItem, stillHeld: number}
     *          | {error: string}}
     */
    checkIn(member, itemId, quantity) {
    }
}
