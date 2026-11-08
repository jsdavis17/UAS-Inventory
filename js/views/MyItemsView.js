import { Database } from '../data/Database.js';
import { Session } from '../services/Session.js';
import { InventoryService } from '../services/InventoryService.js';
import { Toaster } from '../ui/Dialogs.js';

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
    }

    /**
     * List held items with quantity, check-out time and return location.
     * Replaces: viewMine(). Requirements: FR-CI-1. Tests: TC-CI-01, TC-CO-01.
     */
    render() {
    }

    /**
     * "No items checked out" panel with a Browse inventory button.
     * Requirements: UC5 exception. Tests: TC-CI-04.
     */
    renderEmpty() {
    }

    /**
     * Read the return quantity, call InventoryService.checkIn(), then redraw and toast.
     * Replaces: the form half of onReturn().
     * Tests: TC-CI-02, TC-CI-03, TC-CI-04.
     * @param {number} itemId
     */
    submitReturn(itemId) {
    }
}
