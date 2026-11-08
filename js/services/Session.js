import { Database } from '../data/Database.js';
import { User } from '../models/User.js';

/**
 * Session: who is signed in, and logging in and out.
 * Layer: Business. New (replaces the UML's User.validLogIn(), User.endSession()
 * and Main.validLogin()).
 * Replaces: the credential check in onLogin(), endSession(), sess, me().
 */
export class Session {
    /** @type {Database} */
    #database;
    /** @type {User | null} */
    #currentUser;
    /** @type {number} timestamp of the last user action */
    #lastActivity;

    /** Not in the prototype yet (FR-LO-2): 30 minutes in ms. */
    static TIMEOUT_MS;

    /** @param {Database} database */
    constructor(database) {
    }

    /**
     * Check the Student ID and password and start a session if they match.
     * Blank-field messages stay in LoginView; this only checks credentials.
     * Requirements: FR-LI-2, FR-LI-3, FR-LI-4. Tests: TC-LI-01, TC-LI-02, TC-LI-03.
     * @param {string} studentId
     * @param {string} password
     * @returns {{user: User} | {error: string}}
     *          error: "Student ID or password is incorrect."
     */
    login(studentId, password) {
    }

    /**
     * End the session. Replaces: endSession() (minus the screen change).
     * Requirements: FR-LO-1. Tests: TC-LO-01.
     */
    logout() {
    }

    /**
     * Requirements: FR-LI-1, FR-LO-3.
     * @returns {boolean}
     */
    isSignedIn() {
    }

    /**
     * Replaces: me().
     * @returns {User | null}
     */
    getCurrentUser() {
    }

    /**
     * Note a user action so the inactivity timer restarts.
     * Not in the prototype yet (FR-LO-2).
     */
    recordActivity() {
    }

    /**
     * True when 30 minutes have passed with no action.
     * Not in the prototype yet (FR-LO-2).
     * @returns {boolean}
     */
    hasTimedOut() {
    }
}
