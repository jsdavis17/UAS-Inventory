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
    }

    /** @returns {number} */
    getId() {
    }

    /** @returns {number} */
    getTimestamp() {
    }

    /** @returns {string} Student ID of the member who acted */
    getMemberId() {
    }

    /** @returns {'checkout' | 'checkin'} */
    getAction() {
    }

    /** @returns {number} */
    getItemId() {
    }

    /** @returns {string} */
    getItemName() {
    }

    /** @returns {number} */
    getQuantity() {
    }

    /** @returns {string} e.g. "Partial return, 1 still held" */
    getDetail() {
    }

    /**
     * Requirements: SA.3. Tests: TC-CO-04.
     * @returns {boolean}
     */
    isHazardAcknowledged() {
    }

    /**
     * Display ID such as "T-0001". Replaces: txid().
     * Tests: TC-CO-01, TC-CI-02.
     * @returns {string}
     */
    getDisplayId() {
    }
}
