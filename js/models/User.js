/**
 * User: a regular club member account.
 * Layer: Data. UML: User (made concrete, since regular members are Users).
 * Replaces: the member records in seed().
 *
 * The role comes from the class (User, Moderator, Administrator),
 * so there is no separate role string field.
 * Permission methods return false here; subclasses override them.
 * Requirements: FR-LI-5, FR-GN-1.
 */
export class User {
    #id;
    #name;
    #password;

    /**
     * @param {string} id        ERAU Student ID
     * @param {string} name
     * @param {string} password
     */
    constructor(id, name, password) {
    }

    /** @returns {string} */
    getId() {
    }

    /** @returns {string} */
    getName() {
    }

    /**
     * @returns {'User' | 'Moderator' | 'Administrator'}
     */
    getRole() {
    }

    /**
     * Replaces: the m.pw !== pw check in onLogin().
     * Requirements: FR-LI-2. Tests: TC-LI-01, TC-LI-02.
     * @param {string} password
     * @returns {boolean}
     */
    checkPassword(password) {
    }

    /**
     * Not in the prototype yet (FR-EM-5, FR-LI-4 deactivated account).
     * @returns {boolean}
     */
    isActive() {
    }

    /** @returns {boolean} false for regular members (FR-EI-1) */
    canEditInventory() {
    }

    /** @returns {boolean} false for regular members (FR-EM-1) */
    canEditMembers() {
    }

    /** @returns {boolean} false for regular members (FR-ED-1) */
    canEditDatabase() {
    }
}
