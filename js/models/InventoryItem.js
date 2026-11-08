/**
 * InventoryItem: one item in the lab inventory.
 * Layer: Data. UML: Inventory Item.
 * Replaces: the item records built in seed(), codeOf().
 *
 * Available quantity is not stored here. It is calculated by
 * Database.getAvailableQuantity() from the holdings, so it can't drift.
 * search(), filter() and editInventory() from the UML moved to InventoryService.
 */
export class InventoryItem {
    #id;
    #name;
    #category;
    #description;
    #location;
    #totalQuantity;
    #hazardous;

    /**
     * @param {{id: number, name: string, category: string, description: string,
     *          location: string, totalQuantity: number, hazardous: boolean}} details
     */
    constructor(details) {
    }

    /** @returns {number} */
    getId() {
    }

    /** @returns {string} */
    getName() {
    }

    /** @returns {string} */
    getCategory() {
    }

    /** @returns {string} */
    getDescription() {
    }

    /** @returns {string} */
    getLocation() {
    }

    /** @returns {number} */
    getTotalQuantity() {
    }

    /**
     * Requirements: SA.2, FR-SF-4. Tests: TC-SF-05, TC-CO-04.
     * @returns {boolean}
     */
    isHazardous() {
    }

    /**
     * Display code such as "UAS-001". Replaces: codeOf().
     * @returns {string}
     */
    getCode() {
    }

    /**
     * Change the item's details. Not in the prototype yet (UC6, FR-EI-3, FR-EI-4).
     * Replaces the UML's duplicate changeDetails() and editInventory().
     * @param {object} details  fields to change
     */
    update(details) {
    }
}
