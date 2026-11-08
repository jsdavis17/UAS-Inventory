/**
 * Holding: how many units of one item one member currently holds.
 * Layer: Data. New (not in the UML).
 * Replaces: the holdings records in seed() and S.holdings.
 * Requirements: FR-CO-8, FR-CI-1, FR-CI-5.
 */
export class Holding {
    #memberId;
    #itemId;
    #quantity;
    #since;

    /**
     * @param {string} memberId  Student ID
     * @param {number} itemId
     * @param {number} quantity
     * @param {number} since     timestamp (ms) of the first check-out
     */
    constructor(memberId, itemId, quantity, since) {
    }

    /** @returns {string} */
    getMemberId() {
    }

    /** @returns {number} */
    getItemId() {
    }

    /** @returns {number} */
    getQuantity() {
    }

    /** @returns {number} */
    getSince() {
    }

    /**
     * Add units after another check-out of the same item.
     * Requirements: FR-CO-8. Tests: TC-CO-01.
     * @param {number} quantity
     */
    add(quantity) {
    }

    /**
     * Remove units after a return.
     * Requirements: FR-CI-5. Tests: TC-CI-02, TC-CI-04.
     * @param {number} quantity
     */
    remove(quantity) {
    }

    /**
     * True when nothing is left, so the holding can be deleted.
     * Requirements: FR-CI-5. Tests: TC-CI-04.
     * @returns {boolean}
     */
    isEmpty() {
    }
}
