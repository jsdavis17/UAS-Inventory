import { Database } from '../data/Database.js';
import { esc } from '../utils.js';

/**
 * MembersView: read-only list of every member and their role.
 * Layer: Presentation. New (not in the skeleton). Administrators only: Main shows
 * the tab when the user's canEditMembers() is true.
 * Replaces: viewMembers() from the single-file version.
 * Not in the prototype yet: adding, editing and deactivating members (UC7,
 * FR-EM-1 to FR-EM-5).
 * Requirements: FR-LI-5, FR-GN-1.
 */
export class MembersView {
    /** @type {HTMLElement} */
    #root;
    /** @type {Database} */
    #database;

    /**
     * @param {HTMLElement} root
     * @param {Database} database
     */
    constructor(root, database) {
        this.#root = root;
        this.#database = database;
    }

    /**
     * Table of every member's name, Student ID and role.
     */
    render() {
        this.#root.innerHTML = `
            <h1>Members</h1>
            <div class="tablewrap">
                <table class="tbl">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Student ID</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.#database.getUsers().map(user => `
                            <tr>
                                <td>${esc(user.getName())}</td>
                                <td class="mono">${esc(user.getId())}</td>
                                <td>${user.getRole()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}
