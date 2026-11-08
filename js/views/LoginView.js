import { Session } from '../services/Session.js';
import { Database } from '../data/Database.js';

/**
 * LoginView: the sign-in screen and test-account buttons.
 * Layer: Presentation.
 * Replaces: renderLogin(), the form half of onLogin(), the fill action, ui.loginNote.
 * Requirements: UI-2, FR-LI-1, FR-LI-4.
 */
export class LoginView {
    /** @type {HTMLElement} */
    #root;
    /** @type {Session} */
    #session;
    /** @type {Database} */
    #database;
    /** @type {(user: import('../models/User.js').User) => void} */
    #onSignedIn;
    /** @type {string} message shown above the form, e.g. "You signed out." */
    #note;

    /**
     * @param {HTMLElement} root
     * @param {Session} session
     * @param {Database} database  for the test-account list
     * @param {(user: import('../models/User.js').User) => void} onSignedIn
     */
    constructor(root, session, database, onSignedIn) {
    }

    /**
     * Draw the login page. Replaces: renderLogin(). Tests: TC-LI-01, TC-LO-01.
     */
    render() {
    }

    /**
     * Set the note shown above the form, e.g. after signing out.
     * Tests: TC-LO-01.
     * @param {string} note
     */
    setNote(note) {
    }

    /**
     * Check for blank fields, then call Session.login().
     * Replaces: the form half of onLogin().
     * Tests: TC-LI-01, TC-LI-02, TC-LI-03, TC-LI-04.
     */
    handleSubmit() {
    }

    /**
     * Fill the form with a test account. Replaces: the fill action.
     * @param {string} studentId
     */
    fillTestAccount(studentId) {
    }

    /**
     * Requirements: UI-9. Tests: TC-LI-02, TC-LI-03, TC-LI-04.
     * @param {string} message
     */
    showError(message) {
    }

    /**
     * Handle a click on a data-act button that belongs to this view.
     * @param {string} action
     * @param {HTMLElement} element
     * @returns {boolean} true if handled
     */
    handleAction(action, element) {
    }
}
