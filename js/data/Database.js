import { InventoryItem } from '../models/InventoryItem.js';
import { Holding } from '../models/Holding.js';
import { CheckOutHistory } from '../models/CheckOutHistory.js';
import { User } from '../models/User.js';
import { Moderator } from '../models/Moderator.js';
import { Administrator } from '../models/Administrator.js';
import { HR, DAY } from '../utils.js';
import { HR, DAY } from '../utils.js';

/**
 * Database: holds every item, user, holding and history entry, and answers lookups.
 * Layer: Data Access. UML: Database.
 * Replaces: S, seed(), itemById(), memberById(), mname(), categories(), outQty(),
 * availOf(), the S.log push in tx(), and nextTx.
 *
 * Storage: a SQLite database (SI.1) run in the browser by sql.js, which is SQLite
 * compiled to WebAssembly. index.html loads sql-wasm.js before Main.js, so
 * initSqlJs is a global. The database file is kept in localStorage between page
 * loads (PE.5), so edits survive a refresh.
 *
 * Only loadData() is async, because the WebAssembly download is. Every query after
 * that runs synchronously, so the services and views stay synchronous.
 *
 * Later: CSV import and export (FR-ED-2 to FR-ED-5).
 */
export class Database {
    /** sql.js version on cdnjs. index.html must load the same version. */
    static SQL_JS_VERSION = '1.10.3';
    /** localStorage key that holds the exported database file. */
    static STORAGE_KEY = 'uas-inventory.sqlite';

    /** @type {import('sql.js').Database | null} */
    #db;

    constructor() {
        this.#db = null;
    }

    /* Loading and saving */

    /**
     * Open the database. Uses the copy saved in localStorage when there is one,
     * otherwise creates the tables and fills them with the seeded test data.
     * Replaces: seed(). Main.start() must await this before using the database.
     * Test setup: 10 items; 300103 holds 2 LiPo 4S and 1 Soldering Iron;
     * 300104 holds 1 Pixhawk.
     */
    async loadData() {
        const SQL = await Database.#loadSqlJs();
        const saved = Database.#readSavedBytes();

        if (saved) {
            this.#db = new SQL.Database(saved);
            this.#createTables();
            return;
        }

        this.#db = new SQL.Database();
        this.#createTables();
        this.#seed();
        this.saveData();
    }

    /**
     * Write the whole database file to localStorage (PE.5).
     * Called after every change, so callers rarely need it directly.
     */
    saveData() {
        if (!this.#db) {
            return;
        }
        try {
            const bytes = this.#db.export();
            localStorage.setItem(Database.STORAGE_KEY, Database.#toBase64(bytes));
        } catch (error) {
            // Private windows or blocked storage: the app still works for this page load.
            console.warn('Database.saveData: could not persist', error);
        }
    }

    /**
     * Throw away the saved file and return to the seeded test data.
     * Handy for test setup and for the "reset" step in TC-* test cases.
     */
    async resetData() {
        try {
            localStorage.removeItem(Database.STORAGE_KEY);
        } catch (error) {
            console.warn('Database.resetData: could not clear storage', error);
        }
        if (this.#db) {
            this.#db.close();
            this.#db = null;
        }
        await this.loadData();
    }

    /** Resolve sql.js from the global that sql-wasm.js defines. */
    static async #loadSqlJs() {
        const init = globalThis.initSqlJs;
        if (typeof init !== 'function') {
            throw new Error('sql.js is not loaded. Add the sql-wasm.js script tag to '
                + 'index.html before js/Main.js.');
        }
        return init({
            locateFile: file =>
                `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${Database.SQL_JS_VERSION}/${file}`
        });
    }

    /** @returns {Uint8Array | null} */
    static #readSavedBytes() {
        try {
            const text = localStorage.getItem(Database.STORAGE_KEY);
            return text ? Database.#fromBase64(text) : null;
        } catch {
            return null;
        }
    }

    /** @param {Uint8Array} bytes */
    static #toBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i += 0x8000) {
            binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        return btoa(binary);
    }

    /** @param {string} text */
    static #fromBase64(text) {
        const binary = atob(text);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /** Create the four tables if they are missing. Safe to run on an existing file. */
    #createTables() {
        this.#db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id        TEXT PRIMARY KEY,
                name      TEXT NOT NULL,
                password  TEXT NOT NULL,
                role      TEXT NOT NULL DEFAULT 'User'
            );
            CREATE TABLE IF NOT EXISTS items (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                name           TEXT NOT NULL,
                category       TEXT NOT NULL,
                description    TEXT NOT NULL DEFAULT '',
                location       TEXT NOT NULL DEFAULT '',
                total_quantity INTEGER NOT NULL DEFAULT 0,
                hazardous      INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS holdings (
                member_id TEXT    NOT NULL REFERENCES users(id),
                item_id   INTEGER NOT NULL REFERENCES items(id),
                quantity  INTEGER NOT NULL,
                since     INTEGER NOT NULL,
                PRIMARY KEY (member_id, item_id)
            );
            CREATE TABLE IF NOT EXISTS history (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp           INTEGER NOT NULL,
                member_id           TEXT    NOT NULL,
                action              TEXT    NOT NULL,
                item_id             INTEGER NOT NULL,
                item_name           TEXT    NOT NULL,
                quantity            INTEGER NOT NULL,
                detail              TEXT    NOT NULL DEFAULT '',
                hazard_acknowledged INTEGER NOT NULL DEFAULT 0
            );
        `);
    }

    /** Insert the prototype's test data into empty tables. */
    #seed() {
        const now = Date.now();

        this.#run(`INSERT INTO users (id, name, password, role) VALUES (?, ?, ?, 'User')`,
            ['300103', 'Jim Doe', 'uas2026']);
        this.#run(`INSERT INTO users (id, name, password, role) VALUES (?, ?, ?, 'User')`,
            ['300104', 'Janice Doe', 'uas2026']);

        // Columns: name, category, description, location, total, hazard
        const raw = [
            ['LiPo Battery 4S 5000 mAh', 'Batteries',
                '14.8 V pack for 450 mm quadcopters.',
                'Battery Locker A', 12, true],
            ['LiPo Battery 6S 10000 mAh', 'Batteries',
                '22.2 V long-endurance pack for the survey hex.',
                'Battery Locker A', 4, true],
            ['Isopropyl Alcohol 99%, 1 L', 'Chemicals',
                'Cleans flux and preps surfaces before bonding.',
                'Flammables Cabinet', 6, true],
            ['Two-Part Epoxy Kit', 'Chemicals',
                'Structural bonding for carbon fiber frames.',
                'Flammables Cabinet', 5, true],
            ['Soldering Iron Station', 'Tools',
                'Temperature-controlled station with stand.',
                'Workbench 2', 4, false],
            ['Digital Multimeter', 'Tools',
                'Continuity, voltage, and current checks.',
                'Workbench 2', 5, false],
            ['Carbon Fiber Propeller, 10 in', 'Drone Parts',
                'CW/CCW pairs sold as single props.',
                'Parts Shelf 3', 40, false],
            ['450 mm Quadcopter Frame', 'Drone Parts',
                'Carbon plate frame with arms and hardware.',
                'Parts Shelf 1', 6, false],
            ['Pixhawk Flight Controller', 'Electronics',
                'Autopilot board with GPS and power module.',
                'Cabinet B', 5, false],
            ['Safety Glasses', 'Safety Gear',
                'ANSI Z87.1 rated, one size.',
                'Entry Rack', 15, false]
        ];
        for (const [name, category, description, location, total, hazardous] of raw) {
            this.#run(`INSERT INTO items (name, category, description, location,
                                          total_quantity, hazardous)
                       VALUES (?, ?, ?, ?, ?, ?)`,
                [name, category, description, location, total, hazardous ? 1 : 0]);
        }

        const holdings = [
            ['300103', 1, 2, now - 6 * HR],
            ['300103', 5, 1, now - 6 * HR],
            ['300104', 9, 1, now - 1 * DAY]
        ];
        for (const row of holdings) {
            this.#run(`INSERT INTO holdings (member_id, item_id, quantity, since)
                       VALUES (?, ?, ?, ?)`, row);
        }
    }

    /* Query helpers */

    /**
     * Run a statement that returns rows.
     * @param {string} sql
     * @param {unknown[]} [params]
     * @returns {Record<string, any>[]}
     */
    #query(sql, params = []) {
        const statement = this.#db.prepare(sql);
        try {
            statement.bind(params);
            const rows = [];
            while (statement.step()) {
                rows.push(statement.getAsObject());
            }
            return rows;
        } finally {
            statement.free();
        }
    }

    /**
     * Run a statement that returns no rows.
     * @param {string} sql
     * @param {unknown[]} [params]
     */
    #run(sql, params = []) {
        this.#db.run(sql, params);
    }

    /** @returns {number} id of the row inserted by the last INSERT */
    #lastInsertId() {
        return this.#query('SELECT last_insert_rowid() AS id')[0].id;
    }

    /* Row to model */

    /** @param {Record<string, any>} row */
    static #toUser(row) {
        switch (row.role) {
            case 'Administrator':
                return new Administrator(row.id, row.name, row.password);
            case 'Moderator':
                return new Moderator(row.id, row.name, row.password);
            default:
                return new User(row.id, row.name, row.password);
        }
    }

    /** @param {Record<string, any>} row */
    static #toItem(row) {
        return new InventoryItem({
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            location: row.location,
            totalQuantity: row.total_quantity,
            hazardous: row.hazardous === 1
        });
    }

    /** @param {Record<string, any>} row */
    static #toHolding(row) {
        return new Holding(row.member_id, row.item_id, row.quantity, row.since);
    }

    /** @param {Record<string, any>} row */
    static #toHistory(row) {
        return new CheckOutHistory({
            id: row.id,
            timestamp: row.timestamp,
            memberId: row.member_id,
            action: row.action,
            itemId: row.item_id,
            itemName: row.item_name,
            quantity: row.quantity,
            detail: row.detail,
            hazardAcknowledged: row.hazard_acknowledged === 1
        });
    }

    /* Users */

    /** @returns {User[]} */
    getUsers() {
        return this.#query('SELECT * FROM users ORDER BY id').map(Database.#toUser);
    }

    /**
     * Replaces: memberById(), mname().
     * Tests: TC-LI-01, TC-LI-03.
     * @param {string} studentId
     * @returns {User | undefined}
     */
    getUserById(studentId) {
        const rows = this.#query('SELECT * FROM users WHERE id = ?', [studentId]);
        return rows.length ? Database.#toUser(rows[0]) : undefined;
    }

    /**
     * Add a member account. Requirements: FR-EM-1, FR-EM-2.
     * @param {{id: string, name: string, password: string,
     *          role?: 'User' | 'Moderator' | 'Administrator'}} fields
     * @returns {User | {error: string}} error when the Student ID is already taken
     */
    addUser(fields) {
        if (this.getUserById(fields.id)) {
            return { error: `Student ID ${fields.id} already exists.` };
        }
        this.#run('INSERT INTO users (id, name, password, role) VALUES (?, ?, ?, ?)',
            [fields.id, fields.name, fields.password, fields.role || 'User']);
        this.saveData();
        return this.getUserById(fields.id);
    }

    /**
     * Remove a member account. Refuses while the member still holds items.
     * Requirements: FR-EM-1, FR-EM-4.
     * @param {string} studentId
     * @returns {true | {error: string}}
     */
    removeUser(studentId) {
        if (!this.getUserById(studentId)) {
            return { error: `No member with Student ID ${studentId}.` };
        }
        if (this.getHoldingsForMember(studentId).length > 0) {
            return { error: 'Member still has items checked out.' };
        }
        this.#run('DELETE FROM users WHERE id = ?', [studentId]);
        this.saveData();
        return true;
    }

    /* Items */

    /**
     * Requirements: FR-SF-1 (all items when no search).
     * @returns {InventoryItem[]}
     */
    getInventoryList() {
        return this.#query('SELECT * FROM items ORDER BY id').map(Database.#toItem);
    }

    /**
     * Replaces: itemById(). Tests: TC-SF-05.
     * @param {number} itemId
     * @returns {InventoryItem | undefined}
     */
    getItemById(itemId) {
        const rows = this.#query('SELECT * FROM items WHERE id = ?', [itemId]);
        return rows.length ? Database.#toItem(rows[0]) : undefined;
    }

    /**
     * Sorted list of unique categories for the filter dropdown.
     * Replaces: categories(). Tests: TC-SF-03.
     * @returns {string[]}
     */
    getCategories() {
        return this.#query('SELECT DISTINCT category FROM items ORDER BY category')
            .map(row => row.category);
    }

    /**
     * Add an item. The database assigns the ID. Requirements: FR-EI-1, FR-EI-2.
     * @param {{name: string, category: string, description?: string,
     *          location?: string, totalQuantity: number, hazardous?: boolean}} details
     * @returns {InventoryItem}
     */
    addItem(details) {
        this.#run(`INSERT INTO items (name, category, description, location,
                                      total_quantity, hazardous)
                   VALUES (?, ?, ?, ?, ?, ?)`,
            [details.name, details.category, details.description || '',
                details.location || '', details.totalQuantity, details.hazardous ? 1 : 0]);
        const id = this.#lastInsertId();
        this.saveData();
        return this.getItemById(id);
    }

    /**
     * Change an item's stored details. Requirements: FR-EI-3, FR-EI-4.
     * @param {number} itemId
     * @param {{name?: string, category?: string, description?: string,
     *          location?: string, totalQuantity?: number, hazardous?: boolean}} details
     * @returns {InventoryItem | {error: string}}
     */
    updateItem(itemId, details) {
        const current = this.#query('SELECT * FROM items WHERE id = ?', [itemId])[0];
        if (!current) {
            return { error: `No item with ID ${itemId}.` };
        }
        const merged = {
            name: details.name ?? current.name,
            category: details.category ?? current.category,
            description: details.description ?? current.description,
            location: details.location ?? current.location,
            totalQuantity: details.totalQuantity ?? current.total_quantity,
            hazardous: details.hazardous ?? current.hazardous === 1
        };
        this.#run(`UPDATE items SET name = ?, category = ?, description = ?, location = ?,
                                    total_quantity = ?, hazardous = ?
                   WHERE id = ?`,
            [merged.name, merged.category, merged.description, merged.location,
                merged.totalQuantity, merged.hazardous ? 1 : 0, itemId]);
        this.saveData();
        return this.getItemById(itemId);
    }

    /**
     * Remove an item. Refuses while any units are checked out, so holdings and
     * availability never point at a missing item. History rows keep the item name.
     * Requirements: FR-EI-1, FR-EI-5.
     * @param {number} itemId
     * @returns {true | {error: string}}
     */
    removeItem(itemId) {
        if (!this.getItemById(itemId)) {
            return { error: `No item with ID ${itemId}.` };
        }
        if (this.getCheckedOutQuantity(itemId) > 0) {
            return { error: 'Item still has units checked out.' };
        }
        this.#run('DELETE FROM items WHERE id = ?', [itemId]);
        this.saveData();
        return true;
    }

    /* Quantities */

    /**
     * Units of an item currently checked out by anyone. Replaces: outQty().
     * @param {number} itemId
     * @returns {number}
     */
    getCheckedOutQuantity(itemId) {
        return this.#query(
            'SELECT COALESCE(SUM(quantity), 0) AS total FROM holdings WHERE item_id = ?',
            [itemId])[0].total;
    }

    /**
     * Total minus checked out. Replaces: availOf().
     * Requirements: FR-SF-4, FR-CO-1, FR-GN-3. Tests: TC-SF-05, TC-CO-01, TC-CO-06.
     * @param {number} itemId
     * @returns {number}
     */
    getAvailableQuantity(itemId) {
        const rows = this.#query(`
            SELECT items.total_quantity
                   - COALESCE((SELECT SUM(quantity) FROM holdings
                               WHERE holdings.item_id = items.id), 0) AS available
            FROM items WHERE items.id = ?`, [itemId]);
        return rows.length ? rows[0].available : 0;
    }

    /**
     * Counts for the stats line: item types, units on the shelf, units checked out.
     * Replaces: the totals at the top of renderList().
     * @returns {{itemTypes: number, unitsAvailable: number, unitsCheckedOut: number}}
     */
    getStats() {
        const row = this.#query(`
            SELECT (SELECT COUNT(*) FROM items)                           AS item_types,
                   (SELECT COALESCE(SUM(total_quantity), 0) FROM items)   AS total_units,
                   (SELECT COALESCE(SUM(quantity), 0) FROM holdings)      AS out_units`)[0];
        return {
            itemTypes: row.item_types,
            unitsAvailable: row.total_units - row.out_units,
            unitsCheckedOut: row.out_units
        };
    }

    /* Holdings */

    /**
     * Requirements: FR-CI-1. Tests: TC-CI-01.
     * @param {string} memberId
     * @returns {Holding[]} oldest first
     */
    getHoldingsForMember(memberId) {
        return this.#query(
            'SELECT * FROM holdings WHERE member_id = ? ORDER BY since, item_id',
            [memberId]).map(Database.#toHolding);
    }

    /**
     * Who holds this item, for the item dialog's "Checked out by" line.
     * Tests: TC-SF-05.
     * @param {number} itemId
     * @returns {Holding[]}
     */
    getHoldingsForItem(itemId) {
        return this.#query(
            'SELECT * FROM holdings WHERE item_id = ? ORDER BY since, member_id',
            [itemId]).map(Database.#toHolding);
    }

    /**
     * @param {string} memberId
     * @param {number} itemId
     * @returns {Holding | undefined}
     */
    getHolding(memberId, itemId) {
        const rows = this.#query(
            'SELECT * FROM holdings WHERE member_id = ? AND item_id = ?',
            [memberId, itemId]);
        return rows.length ? Database.#toHolding(rows[0]) : undefined;
    }

    /**
     * Insert a new holding. Requirements: FR-CO-8.
     * @param {Holding} holding
     */
    addHolding(holding) {
        this.#run(`INSERT INTO holdings (member_id, item_id, quantity, since)
                   VALUES (?, ?, ?, ?)`,
            [holding.getMemberId(), holding.getItemId(),
                holding.getQuantity(), holding.getSince()]);
        this.saveData();
    }

    /**
     * Write a changed quantity back after Holding.add() or Holding.remove().
     * A Holding object is a copy of a row, so edits to it must be saved here.
     * Deletes the row when the holding is empty.
     * Requirements: FR-CO-8, FR-CI-5. Tests: TC-CO-01, TC-CI-02, TC-CI-04.
     * @param {Holding} holding
     */
    updateHolding(holding) {
        if (holding.isEmpty()) {
            this.removeHolding(holding);
            return;
        }
        this.#run('UPDATE holdings SET quantity = ? WHERE member_id = ? AND item_id = ?',
            [holding.getQuantity(), holding.getMemberId(), holding.getItemId()]);
        this.saveData();
    }

    /**
     * Requirements: FR-CI-5. Tests: TC-CI-04.
     * @param {Holding} holding
     */
    removeHolding(holding) {
        this.#run('DELETE FROM holdings WHERE member_id = ? AND item_id = ?',
            [holding.getMemberId(), holding.getItemId()]);
        this.saveData();
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
        this.#run(`INSERT INTO history (timestamp, member_id, action, item_id, item_name,
                                        quantity, detail, hazard_acknowledged)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [Date.now(), fields.memberId, fields.action, fields.itemId, fields.itemName,
                fields.quantity, fields.detail || '', fields.hazardAcknowledged ? 1 : 0]);
        const id = this.#lastInsertId();
        this.saveData();
        return Database.#toHistory(
            this.#query('SELECT * FROM history WHERE id = ?', [id])[0]);
    }

    /**
     * Read-only list of entries, oldest first. Not shown on any screen yet (FR-ED-6).
     * Entries are never edited or deleted (FR-GN-2, SE.5).
     * @returns {CheckOutHistory[]}
     */
    getHistory() {
        return this.#query('SELECT * FROM history ORDER BY id').map(Database.#toHistory);
    }
}
