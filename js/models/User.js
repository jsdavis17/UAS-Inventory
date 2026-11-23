import { verifyPassword } from '../services/Credentials.js';

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
    #passwordHash;

    /**
     * @param {string} id            ERAU Student ID
     * @param {string} name
     * @param {string} passwordHash  bcrypt hash; the plain password is never stored
     */
    constructor(id, name, passwordHash) {
        this.#id = id;
        this.#name = name;
        this.#passwordHash = passwordHash;
    }

    /** @returns {string} */
    getId() {
        return this.#id;
    }

    /** @returns {string} */
    getName() {
        return this.#name;
    }

    /**
     * @returns {'User' | 'Moderator' | 'Administrator'}
     */
    getRole() {
        return 'User';
    }

    /**
     * Compare a typed password with the stored bcrypt hash.
     * Replaces: the m.pw !== pw check in onLogin().
     * Requirements: FR-LI-2. Tests: TC-LI-01, TC-LI-02.
     * @param {string} password
     * @returns {boolean}
     */
    checkPassword(password) {
        return verifyPassword(password, this.#passwordHash);
    }

    /**
     * Not in the prototype yet (FR-EM-5, FR-LI-4 deactivated account).
     * @returns {boolean}
     */
    isActive() {
        return true;
    }

    /** @returns {boolean} false for regular members (FR-EI-1) */
    canEditInventory() {
        return false;
    }

    /** @returns {boolean} false for regular members (FR-EM-1) */
    canEditMembers() {
        return false;
    }

    /** @returns {boolean} false for regular members (FR-ED-1) */
    canEditDatabase() {
        return false;
    }
}
