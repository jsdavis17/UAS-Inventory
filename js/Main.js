import { Database } from './data/Database.js';
import { Session } from './services/Session.js';
import { InventoryService } from './services/InventoryService.js';
import { Dialogs, Toaster } from './ui/Dialogs.js';
import { LoginView } from './views/LoginView.js';
import { InventoryView } from './views/InventoryView.js';
import { ItemDialog } from './views/ItemDialog.js';
import { MyItemsView } from './views/MyItemsView.js';

/**
 * Main: starts the app, creates every object, routes between views and wires events.
 * Layer: Presentation. UML: Main (as the app controller; the console methods
 * displayMenu(Scanner) and processChoice(Scanner) don't apply in a browser).
 * Replaces: render(), refresh(), renderShell(), TABS, ui.view, the click, submit,
 * input and change listeners, and the logout, tab and gomine actions.
 * Requirements: UI-1, UI-4.
 */
export class Main {
    /** Tabs in the header: Inventory, My items. Move TABS here. */
    static TABS;

    /** @type {Database} */
    #database;
    /** @type {Session} */
    #session;
    /** @type {InventoryService} */
    #inventoryService;
    /** @type {Dialogs} */
    #dialogs;
    /** @type {Toaster} */
    #toaster;
    /** @type {LoginView} */
    #loginView;
    /** @type {InventoryView} */
    #inventoryView;
    /** @type {ItemDialog} */
    #itemDialog;
    /** @type {MyItemsView} */
    #myItemsView;
    /** @type {'inventory' | 'mine'} */
    #currentView;

    constructor() {
    }

    /**
     * Load data, create the services and views, attach listeners, show the login page.
     */
    start() {
    }

    /**
     * Login page when signed out, otherwise header plus the current view.
     * Replaces: render() and refresh().
     * Requirements: FR-LI-1, FR-LO-4.
     */
    render() {
    }

    /**
     * Header with brand, tabs, user name and Log out, plus the <main> area.
     * Replaces: renderShell(). Tests: TC-LI-01.
     */
    renderShell() {
    }

    /**
     * Switch tabs. Replaces: the tab and gomine actions.
     * @param {'inventory' | 'mine'} viewId
     */
    showView(viewId) {
    }

    /**
     * Called by LoginView after a good login. Tests: TC-LI-01.
     * @param {import('./models/User.js').User} user
     */
    handleSignedIn(user) {
    }

    /**
     * Close dialogs, end the session, show "You signed out."
     * Replaces: the logout action and endSession().
     * Requirements: FR-LO-1, FR-LO-4. Tests: TC-LO-01.
     */
    logout() {
    }

    /**
     * Document click listener: backdrop clicks, then data-act buttons, passed to
     * the view that owns the action.
     * @param {MouseEvent} event
     */
    handleClick(event) {
    }

    /**
     * Document submit listener: login, check-out and return forms.
     * @param {SubmitEvent} event
     */
    handleSubmit(event) {
    }

    /**
     * Document input listener (search box). Fix D-01: the search box is handled
     * here only, not in handleChange.
     * @param {Event} event
     */
    handleInput(event) {
    }

    /**
     * Document change listener: category filter and hazard checkbox only.
     * @param {Event} event
     */
    handleChange(event) {
    }
}

// Entry point (add when implementing): new Main().start();
