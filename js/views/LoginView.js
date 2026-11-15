import { Session } from '../services/Session.js';
import { Database } from '../data/Database.js';
import { $, esc } from '../utils.js';

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
        this.#root = root;
        this.#session = session;
        this.#database = database;
        this.#onSignedIn = onSignedIn;
        this.#note = '';
    }

    /**
     * Draw the login page. Replaces: renderLogin(). Tests: TC-LI-01, TC-LO-01.
     */
    render() {
        this.#root.innerHTML = `
            <div class="wrap">
                <div class="login">
                    <h1>UAS Inventory</h1>
                    <p class="muted" style="margin-bottom:12px">UAS Club lab equipment check-out</p>
                    <section class="login-card">
                        <h2>Sign in</h2>
                        ${this.#note ? '<p class="login-note" role="alert">' + esc(this.#note) + '</p>' : ''}
                        <form id="loginForm" novalidate class="form-grid">
                            <div class="fld">
                                <label class="lbl" for="sid">ERAU Student ID</label>
                                <input id="sid" type="text" inputmode="numeric" autocomplete="username">
                            </div>
                            <div class="fld">
                                <label class="lbl" for="pw">Password</label>
                                <input id="pw" type="password" autocomplete="current-password">
                            </div>
                            <p class="err" id="loginErr" role="alert"></p>
                            <div>
                                <button class="btn btn-primary" type="submit">Sign in</button>
                            </div>
                        </form>
                        <div class="demo-accts">
                            <p class="small muted">Test accounts (password <code>uas2026</code>):</p>
                            ${this.#database.getUsers().map(user => `
                                <div>
                                    <button type="button" class="link" data-act="fill" data-id="${user.getId()}">${esc(user.getName())} (${user.getId()}) - ${user.getRole()}</button>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    /**
     * Set the note shown above the form, e.g. after signing out.
     * Tests: TC-LO-01.
     * @param {string} note
     */
    setNote(note) {
        this.#note = note;
    }

    /**
     * Check for blank fields, then call Session.login().
     * Replaces: the form half of onLogin().
     * Tests: TC-LI-01, TC-LI-02, TC-LI-03, TC-LI-04.
     */
    handleSubmit() {
        const id = $('#sid').value.trim();
        const pw = $('#pw').value;

        if (!id || !pw) {
            this.showError(!id && !pw ?
                'Enter your Student ID and password.' :
                !id ?
                'Enter your Student ID.' :
                'Enter your password.');
            (!id ? $('#sid') : $('#pw')).focus();
            return;
        }

        const result = this.#session.login(id, pw);

        if (result.error) {
            this.showError(result.error);
            return;
        }

        this.#note = '';
        this.#onSignedIn(result.user);
    }

    /**
     * Fill the form with a test account. Replaces: the fill action.
     * @param {string} studentId
     */
    fillTestAccount(studentId) {
        $('#sid').value = studentId;
        $('#pw').value = 'uas2026';
        $('#loginErr').textContent = '';
        $('#loginForm button[type=submit]').focus();
    }

    /**
     * Requirements: UI-9. Tests: TC-LI-02, TC-LI-03, TC-LI-04.
     * @param {string} message
     */
    showError(message) {
        $('#loginErr').textContent = message;
    }

    /**
     * Handle a click on a data-act button that belongs to this view.
     * @param {string} action
     * @param {HTMLElement} element
     * @returns {boolean} true if handled
     */
    handleAction(action, element) {
        if (action === 'fill') {
            this.fillTestAccount(element.dataset.id);
            return true;
        }

        return false;
    }
}
