import { User } from './User.js';

/**
 * Moderator: club officer who can edit inventory records.
 * Layer: Data. UML: Moderator extends User.
 * Inherits id, name and password from User (no repeated fields).
 *
 * Open question: SRS 1.3 says Moderators can update user roles, but 2.3 and UC7
 * say only Administrators edit members. canEditMembers() stays false until settled.
 */
export class Moderator extends User {
    /** @returns {'Moderator'} */
    getRole() {
    }

    /**
     * Requirements: FR-EI-1. Not in the prototype yet (UC6).
     * @returns {boolean} true
     */
    canEditInventory() {
    }
}
