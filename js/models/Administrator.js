import { User } from './User.js';

/**
 * Administrator: inventory manager with full control.
 * Layer: Data. UML: Administrator extends User.
 * Inherits id, name and password from User (no repeated fields).
 * Requirements: SE.2. Not in the prototype yet (UC6 to UC8).
 */
export class Administrator extends User {
    /** @returns {'Administrator'} */
    getRole() {
        return 'Administrator';
    }

    /**
     * Requirements: FR-EI-1.
     * @returns {boolean} true
     */
    canEditInventory() {
        return true;
    }

    /**
     * Requirements: FR-EM-1.
     * @returns {boolean} true
     */
    canEditMembers() {
        return true;
    }

    /**
     * Requirements: FR-ED-1.
     * @returns {boolean} true
     */
    canEditDatabase() {
        return true;
    }
}
