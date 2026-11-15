import { InventoryItem } from '../models/InventoryItem.js';
import { Holding } from '../models/Holding.js';
import { CheckOutHistory } from '../models/CheckOutHistory.js';
import { User } from '../models/User.js';
import { Moderator } from '../models/Moderator.js';
import { Administrator } from '../models/Administrator.js';
import { HR, DAY } from '../utils.js';

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
        this.#items = [];
        this.#users = [];
        this.#holdings = [];
        this.#history = [];
        this.#nextHistoryId = 1;
    }

    /* Loading and saving */

    /**
     * Fill the database with the seeded test data. Replaces: seed().
     * Test setup: 10 items; 3 accounts, all with password uas2026:
     * 2610000 Jim Doe (Administrator) holds 2 LiPo 4S and 1 Soldering Iron;
     * 2610001 Janice Doe (Moderator) holds 1 Pixhawk;
     * 2610002 John Doe (User) holds nothing.
     */
    loadData() {
        const now = Date.now();

        this.#users = [
            new Administrator('2610000', 'Jim Doe', 'uas2026'),
            new Moderator('2610001', 'Janice Doe', 'uas2026'),
            new User('2610002', 'John Doe', 'uas2026')
        ];

        // Columns: name, category, description, location, total, hazard
        const raw = [
            ['LiPo Battery 4S 5000 mAh', 'Batteries',
                '14.8 V pack for 450 mm quadcopters.',
                'Battery Locker A', 12, true
            ],
            ['LiPo Battery 6S 10000 mAh', 'Batteries',
                '22.2 V long-endurance pack for the survey hex.',
                'Battery Locker A', 4, true
            ],
            ['Isopropyl Alcohol 99%, 1 L', 'Chemicals',
                'Cleans flux and preps surfaces before bonding.',
                'Flammables Cabinet', 6, true
            ],
            ['Two-Part Epoxy Kit', 'Chemicals',
                'Structural bonding for carbon fiber frames.',
                'Flammables Cabinet', 5, true
            ],
            ['Soldering Iron Station', 'Tools',
                'Temperature-controlled station with stand.',
                'Workbench 2', 4, false
            ],
            ['Digital Multimeter', 'Tools',
                'Continuity, voltage, and current checks.',
                'Workbench 2', 5, false
            ],
            ['Carbon Fiber Propeller, 10 in', 'Drone Parts',
                'CW/CCW pairs sold as single props.',
                'Parts Shelf 3', 40, false
            ],
            ['450 mm Quadcopter Frame', 'Drone Parts',
                'Carbon plate frame with arms and hardware.',
                'Parts Shelf 1', 6, false
            ],
            ['Pixhawk Flight Controller', 'Electronics',
                'Autopilot board with GPS and power module.',
                'Cabinet B', 5, false
            ],
            ['Safety Glasses', 'Safety Gear',
                'ANSI Z87.1 rated, one size.', 'Entry Rack', 15,
                false
            ]
        ];

        this.#items = raw.map((r, i) => new InventoryItem({
            id: i + 1,
            name: r[0],
            category: r[1],
            description: r[2],
            location: r[3],
            totalQuantity: r[4],
            hazardous: r[5]
        }));

        this.#holdings = [
            new Holding('2610000', 1, 2, now - 6 * HR),
            new Holding('2610000', 5, 1, now - 6 * HR),
            new Holding('2610001', 9, 1, now - 1 * DAY)
        ];

        this.#history = [];
        this.#nextHistoryId = 1;
    }

    /** Not in the prototype yet (PE.5, SI.1). */
    saveData() {
    }

    /* Users */

    /** @returns {User[]} */
    getUsers() {
        return [...this.#users];
    }

    /**
     * Replaces: memberById(), mname().
     * Tests: TC-LI-01, TC-LI-03.
     * @param {string} studentId
     * @returns {User | undefined}
     */
    getUserById(studentId) {
        return this.#users.find(u => u.getId() === studentId);
    }

    /* Items */

    /**
     * Requirements: FR-SF-1 (all items when no search).
     * @returns {InventoryItem[]}
     */
    getInventoryList() {
        return [...this.#items];
    }

    /**
     * Replaces: itemById(). Tests: TC-SF-05.
     * @param {number} itemId
     * @returns {InventoryItem | undefined}
     */
    getItemById(itemId) {
        return this.#items.find(i => i.getId() === itemId);
    }

    /**
     * Sorted list of unique categories for the filter dropdown.
     * Replaces: categories(). Tests: TC-SF-03.
     * @returns {string[]}
     */
    getCategories() {
        return [...new Set(this.#items.map(i => i.getCategory()))].sort();
    }

    /* Quantities */

    /**
     * Units of an item currently checked out by anyone. Replaces: outQty().
     * @param {number} itemId
     * @returns {number}
     */
    getCheckedOutQuantity(itemId) {
        return this.#holdings
            .filter(h => h.getItemId() === itemId)
            .reduce((sum, h) => sum + h.getQuantity(), 0);
    }

    /**
     * Total minus checked out. Replaces: availOf().
     * Requirements: FR-SF-4, FR-CO-1, FR-GN-3. Tests: TC-SF-05, TC-CO-01, TC-CO-06.
     * @param {number} itemId
     * @returns {number}
     */
    getAvailableQuantity(itemId) {
        return this.getItemById(itemId).getTotalQuantity() -
            this.getCheckedOutQuantity(itemId);
    }

    /**
     * Counts for the stats line: item types, units on the shelf, units checked out.
     * Replaces: the totals at the top of renderList().
     * @returns {{itemTypes: number, unitsAvailable: number, unitsCheckedOut: number}}
     */
    getStats() {
        let unitsAvailable = 0;
        let unitsCheckedOut = 0;

        for (const item of this.#items) {
            unitsAvailable += this.getAvailableQuantity(item.getId());
            unitsCheckedOut += this.getCheckedOutQuantity(item.getId());
        }

        return {
            itemTypes: this.#items.length,
            unitsAvailable,
            unitsCheckedOut
        };
    }

    /* Holdings */

    /**
     * Requirements: FR-CI-1. Tests: TC-CI-01.
     * @param {string} memberId
     * @returns {Holding[]} oldest first
     */
    getHoldingsForMember(memberId) {
        return this.#holdings
            .filter(h => h.getMemberId() === memberId)
            .sort((a, b) => a.getSince() - b.getSince());
    }

    /**
     * Who holds this item, for the item dialog's "Checked out by" line.
     * Tests: TC-SF-05.
     * @param {number} itemId
     * @returns {Holding[]}
     */
    getHoldingsForItem(itemId) {
        return this.#holdings.filter(h => h.getItemId() === itemId);
    }

    /**
     * @param {string} memberId
     * @param {number} itemId
     * @returns {Holding | undefined}
     */
    getHolding(memberId, itemId) {
        return this.#holdings.find(h => h.getMemberId() === memberId &&
            h.getItemId() === itemId);
    }

    /**
     * Requirements: FR-CO-8.
     * @param {Holding} holding
     */
    addHolding(holding) {
        this.#holdings.push(holding);
    }

    /**
     * Requirements: FR-CI-5. Tests: TC-CI-04.
     * @param {Holding} holding
     */
    removeHolding(holding) {
        this.#holdings.splice(this.#holdings.indexOf(holding), 1);
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
        const entry = new CheckOutHistory({
            ...fields,
            id: this.#nextHistoryId++,
            timestamp: Date.now()
        });

        this.#history.push(entry);
        return entry;
    }

    /**
     * Read-only list of entries. Not shown on any screen yet (FR-ED-6).
     * @returns {CheckOutHistory[]}
     */
    getHistory() {
        return [...this.#history];
    }
}
