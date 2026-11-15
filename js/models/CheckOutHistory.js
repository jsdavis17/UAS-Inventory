/**
 * CheckOutHistory: one entry in the transaction log.
 * Layer: Data. UML: Check-Out History (one entry).
 * Replaces: the entry object built in tx(), txid().
 *
 * All fields are private with getters only. Entries are never edited (FR-GN-2, SE.5).
 * Requirements: FR-CO-6, FR-CI-4, SA.3, SE.1.
 */
export class CheckOutHistory {
    #id;
    #timestamp;
    #memberId;
    #action;
    #itemId;
    #itemName;
    #quantity;
    #detail;
    #hazardAcknowledged;

    /**
     * @param {{id: number, timestamp: number, memberId: string,
     *          action: 'checkout' | 'checkin', itemId: number, itemName: string,
     *          quantity: number, detail?: string, hazardAcknowledged?: boolean}} fields
     */
    constructor(fields) {
        this.#id = fields.id;
        this.#timestamp = fields.timestamp;
        this.#memberId = fields.memberId;
        this.#action = fields.action;
        this.#itemId = fields.itemId;
        this.#itemName = fields.itemName;
        this.#quantity = fields.quantity;
        this.#detail = fields.detail || '';
        this.#hazardAcknowledged = !!fields.hazardAcknowledged;
    }

    /** @returns {number} */
    getId() {
        return this.#id;
    }

    /** @returns {number} */
    getTimestamp() {
        return this.#timestamp;
    }

    /** @returns {string} Student ID of the member who acted */
    getMemberId() {
        return this.#memberId;
    }

    /** @returns {'checkout' | 'checkin'} */
    getAction() {
        return this.#action;
    }

    /** @returns {number} */
    getItemId() {
        return this.#itemId;
    }

    /** @returns {string} */
    getItemName() {
        return this.#itemName;
    }

    /** @returns {number} */
    getQuantity() {
        return this.#quantity;
    }

    /** @returns {string} e.g. "Partial return, 1 still held" */
    getDetail() {
        return this.#detail;
    }

    /**
     * Requirements: SA.3. Tests: TC-CO-04.
     * @returns {boolean}
     */
    isHazardAcknowledged() {
        return this.#hazardAcknowledged;
    }

    /**
     * Display ID such as "T-0001". Replaces: txid().
     * Tests: TC-CO-01, TC-CI-02.
     * @returns {string}
     */
    getDisplayId() {
        return 'T-' + String(this.#id).padStart(4, '0');
    }
}
