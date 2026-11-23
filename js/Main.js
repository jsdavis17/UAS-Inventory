import { Database } from './data/Database.js';
import { Session } from './services/Session.js';
import { InventoryService } from './services/InventoryService.js';
import { Dialogs, Toaster } from './ui/Dialogs.js';
import { LoginView } from './views/LoginView.js';
import { InventoryView } from './views/InventoryView.js';
import { ItemDialog } from './views/ItemDialog.js';
import { MyItemsView } from './views/MyItemsView.js';
import { MembersView } from './views/MembersView.js';
import { $, esc } from './utils.js';

/**
 * Main: starts the app, creates every object, routes between views and wires events.
 * Layer: Presentation. UML: Main (as the app controller; the console methods
 * displayMenu(Scanner) and processChoice(Scanner) don't apply in a browser).
 * Replaces: render(), refresh(), renderShell(), TABS, ui.view, the click, submit,
 * input and change listeners, and the logout, tab and gomine actions.
 * Requirements: UI-1, UI-4.
 */
export class Main {
    /**
     * Tabs in the header: Inventory, My items, Members.
     * allowed(user) says whether that user's role may open the tab.
     * Requirements: FR-LI-5.
     */
    static TABS = [{
            id: 'inventory',
            label: 'Inventory',
            allowed: user => true
        },
        {
            id: 'mine',
            label: 'My items',
            allowed: user => true
        },
        {
            id: 'members',
            label: 'Members',
            allowed: user => user.canEditMembers()
        }
    ];

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
    /** @type {MembersView} */
    #membersView;
    /** @type {'inventory' | 'mine' | 'members'} */
    #currentView;
    /**
     * The <main> box the views draw into. Built once in start() and put back by
     * renderShell(), because renderShell() replaces everything inside #app.
     * @type {HTMLElement}
     */
    #mainArea;

    constructor() {
    }

    /**
     * Load data, create the services and views, attach listeners, show the login page.
     */
    async start() {
        this.#database = new Database();
        // Must finish before any view reads the database
        await this.#database.loadData();
        this.#session = new Session(this.#database);
        this.#inventoryService = new InventoryService(this.#database);
        this.#dialogs = new Dialogs($('#dlg'), $('#dlg2'));
        this.#toaster = new Toaster($('#toasts'));

        // Made once and put back into the page on every redraw, so the views always draw into the same box
        this.#mainArea = document.createElement('main');
        this.#mainArea.id = 'main';

        this.#loginView = new LoginView($('#app'), this.#session, this.#database,
            user => this.handleSignedIn(user));
        this.#inventoryView = new InventoryView(this.#mainArea, this.#database,
            this.#inventoryService, itemId => this.#itemDialog.open(itemId));
        this.#itemDialog = new ItemDialog(this.#dialogs, this.#toaster, this.#database,
            this.#session, this.#inventoryService, () => {
                this.#dialogs.closeAll();
                this.showView('mine');
            });
        this.#myItemsView = new MyItemsView(this.#mainArea, this.#database, this.#session,
            this.#inventoryService, this.#toaster);
        this.#membersView = new MembersView(this.#mainArea, this.#database);
        this.#currentView = 'inventory';

        document.addEventListener('click', e => this.handleClick(e));
        document.addEventListener('submit', e => this.handleSubmit(e));
        document.addEventListener('input', e => this.handleInput(e));
        document.addEventListener('change', e => this.handleChange(e));
        this.#dialogs.getPrimary().addEventListener('close', () => this.render());

        this.render();
    }

    /**
     * Login page when signed out, otherwise header plus the current view.
     * Replaces: render() and refresh().
     * Requirements: FR-LI-1, FR-LO-4.
     */
    render() {
        if (!this.#session.isSignedIn()) {
            this.#loginView.render();
            return;
        }

        this.renderShell();
    }

    /**
     * Header with brand, tabs, user name and Log out, plus the <main> area.
     * Replaces: renderShell(). Tests: TC-LI-01.
     */
    renderShell() {
        const user = this.#session.getCurrentUser();

        $('#app').innerHTML = `
            <div class="wrap">
                <header class="top">
                    <div class="brand">UAS Inventory</div>
                    <nav class="tabs" aria-label="Main">
                        ${Main.TABS.filter(t => t.allowed(user)).map(t => `
                            <button class="tab" data-act="tab" data-v="${t.id}" ${this.#currentView === t.id ? 'aria-current="page"' : ''}>${t.label}</button>
                        `).join('')}
                    </nav>
                    <div class="who">
                        <span>${esc(user.getName())} (<span class="mono">${esc(user.getId())}</span>) - ${user.getRole()}</span>
                        <button class="btn btn-sm" data-act="logout">Log out</button>
                    </div>
                </header>
            </div>
        `;

        $('#app .wrap').append(this.#mainArea);

        if (this.#currentView === 'mine') {
            this.#myItemsView.render();
        } else if (this.#currentView === 'members') {
            this.#membersView.render();
        } else {
            this.#inventoryView.render();
        }
    }

    /**
     * Switch tabs, refusing any tab the user's role doesn't allow.
     * Replaces: the tab and gomine actions.
     * Requirements: FR-GN-1.
     * @param {'inventory' | 'mine' | 'members'} viewId
     */
    showView(viewId) {
        const tab = Main.TABS.find(t => t.id === viewId);

        // The tab is hidden for other roles, but check again in case the button is faked
        if (!tab.allowed(this.#session.getCurrentUser())) {
            this.#toaster.show('Your role can’t open that page.', 'err');
            return;
        }

        this.#currentView = viewId;
        this.render();
        window.scrollTo(0, 0);
    }

    /**
     * Called by LoginView after a good login. Tests: TC-LI-01.
     * @param {import('./models/User.js').User} user
     */
    handleSignedIn(user) {
        this.#currentView = 'inventory';
        this.render();
        this.#toaster.show('Signed in as ' + user.getName() + '.', 'ok');
    }

    /**
     * Close dialogs, end the session, show "You signed out."
     * Replaces: the logout action and endSession().
     * Requirements: FR-LO-1, FR-LO-4. Tests: TC-LO-01.
     */
    logout() {
        this.#dialogs.closeAll();
        this.#session.logout();
        this.#loginView.setNote('You signed out.');
        this.render();
    }

    /**
     * Document click listener: backdrop clicks, then data-act buttons, passed to
     * the view that owns the action.
     * @param {MouseEvent} event
     */
    handleClick(event) {
        if (this.#dialogs.handleBackdropClick(event)) {
            return;
        }

        const el = event.target.closest('[data-act]');

        if (!el) {
            return;
        }

        const action = el.dataset.act;

        // Actions that change the whole screen are handled here
        if (action === 'logout') {
            this.logout();
        } else if (action === 'tab') {
            this.showView(el.dataset.v);
        } else if (action === 'closedlg') {
            this.#dialogs.close(this.#dialogs.getPrimary());
        } else if (!this.#loginView.handleAction(action, el) &&
            !this.#inventoryView.handleAction(action, el)) {
            this.#itemDialog.handleAction(action, el);
        }
    }

    /**
     * Document submit listener: login, check-out and return forms.
     * @param {SubmitEvent} event
     */
    handleSubmit(event) {
        const form = event.target;
        event.preventDefault();

        if (form.id === 'loginForm') {
            this.#loginView.handleSubmit();
        } else if (form.id === 'coForm') {
            this.#itemDialog.submitCheckout();
        } else if (form.dataset.ret) {
            this.#myItemsView.submitReturn(+form.dataset.ret);
        }
    }

    /**
     * Document input listener (search box). Fix D-01: the search box is handled
     * here only, not in handleChange.
     * @param {Event} event
     */
    handleInput(event) {
        this.#inventoryView.handleInput(event);
    }

    /**
     * Document change listener: category filter and hazard checkbox only.
     * @param {Event} event
     */
    handleChange(event) {
        if (event.target.id === 'ack') {
            this.#itemDialog.setAcknowledged(event.target.checked);
            return;
        }

        this.#inventoryView.handleInput(event);
    }
}

// Entry point
new Main().start().catch(error => console.error('UAS Inventory failed to start', error));
