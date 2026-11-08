import { InventoryItem } from '../models/InventoryItem.js';
import { Holding } from '../models/Holding.js';
import { CheckOutHistory } from '../models/CheckOutHistory.js';
import { User } from '../models/User.js';
import { Moderator } from '../models/Moderator.js';
import { Administrator } from '../models/Administrator.js';

/**
 * Database: holds every item, user, holding and history entry, and answers lookups.
 * Layer: Data Access. UML: Database.
 * Replaces: S, seed(), itemById(), memberById(), mname(), categories(), outQty(),
 * availOf(), the S.log push in tx(), and nextTx.
 *
 * Later: swap the in-memory arrays for SQLite (SI.1), keep data across restarts (PE.5),
 * and add CSV import and export (FR-ED-2 to FR-ED-5).
 */
export class Database {
    /** @type {InventoryItem[]} */
    #items;
    /** @type {User[]} */
    #users;
    /** @type {Holding[]} */
    #holdings;
    /** @type {CheckOutHistory[]} */
    #history;
    /** @type {number} */
    #nextHistoryId;

    constructor() {
    }

    /* Loading and saving */

    /**
     * Fill the database with the seeded test data. Replaces: seed().
     * Test setup: 10 items; 300103 holds 2 LiPo 4S and 1 Soldering Iron;
     * 300104 holds 1 Pixhawk.
     */
    loadData() {
    }

    /** Not in the prototype yet (PE.5, SI.1). */
    saveData() {
    }

    /* Users */

    /** @returns {User[]} */
    getUsers() {
    }

    /**
     * Replaces: memberById(), mname().
     * Tests: TC-LI-01, TC-LI-03.
     * @param {string} studentId
     * @returns {User | undefined}
     */
    getUserById(studentId) {
    }

    /* Items */

    /**
     * Requirements: FR-SF-1 (all items when no search).
     * @returns {InventoryItem[]}
     */
    getInventoryList() {
    }

    /**
     * Replaces: itemById(). Tests: TC-SF-05.
     * @param {number} itemId
     * @returns {InventoryItem | undefined}
     */
    getItemById(itemId) {
    }

    /**
     * Sorted list of unique categories for the filter dropdown.
     * Replaces: categories(). Tests: TC-SF-03.
     * @returns {string[]}
     */
    getCategories() {
    }

    /* Quantities */

    /**
     * Units of an item currently checked out by anyone. Replaces: outQty().
     * @param {number} itemId
     * @returns {number}
     */
    getCheckedOutQuantity(itemId) {
    }

    /**
     * Total minus checked out. Replaces: availOf().
     * Requirements: FR-SF-4, FR-CO-1, FR-GN-3. Tests: TC-SF-05, TC-CO-01, TC-CO-06.
     * @param {number} itemId
     * @returns {number}
     */
    getAvailableQuantity(itemId) {
    }

    /**
     * Counts for the stats line: item types, units on the shelf, units checked out.
     * Replaces: the totals at the top of renderList().
     * @returns {{itemTypes: number, unitsAvailable: number, unitsCheckedOut: number}}
     */
    getStats() {
    }

    /* Holdings */

    /**
     * Requirements: FR-CI-1. Tests: TC-CI-01.
     * @param {string} memberId
     * @returns {Holding[]} oldest first
     */
    getHoldingsForMember(memberId) {
    }

    /**
     * Who holds this item, for the item dialog's "Checked out by" line.
     * Tests: TC-SF-05.
     * @param {number} itemId
     * @returns {Holding[]}
     */
    getHoldingsForItem(itemId) {
    }

    /**
     * @param {string} memberId
     * @param {number} itemId
     * @returns {Holding | undefined}
     */
    getHolding(memberId, itemId) {
    }

    /**
     * Requirements: FR-CO-8.
     * @param {Holding} holding
     */
    addHolding(holding) {
    }

    /**
     * Requirements: FR-CI-5. Tests: TC-CI-04.
     * @param {Holding} holding
     */
    removeHolding(holding) {
    }

    /* History */

    /**
     * Create and store a log entry with the next ID and the current time.
     * Replaces: tx(). Requirements: FR-CO-6, FR-CI-4, SA.3, SE.1.
     * @param {{memberId: string, action: 'checkout' | 'checkin', itemId: number,
     *          itemName: string, quantity: number, detail?: string,
     *          hazardAcknowledged?: boolean}} fields
     * @returns {CheckOutHistory}
     */
    addHistory(fields) {
    }

    /**
     * Read-only list of entries. Not shown on any screen yet (FR-ED-6).
     * @returns {CheckOutHistory[]}
     */
    getHistory() {
    }
}
