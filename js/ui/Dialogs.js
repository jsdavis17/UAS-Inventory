/**
 * Dialogs: opening, closing and framing the two <dialog> elements.
 * Layer: Presentation.
 * Replaces: shell(), openD(), closeAllDialogs(), the backdrop-click check,
 * and the closedlg action.
 * The prototype's close2 action and shell()'s id parameter were never used; drop them.
 */
export class Dialogs {
    /** @type {HTMLDialogElement} main dialog (#dlg) */
    #primary;
    /** @type {HTMLDialogElement} hazard warning dialog (#dlg2) */
    #secondary;

    /**
     * @param {HTMLDialogElement} primary
     * @param {HTMLDialogElement} secondary
     */
    constructor(primary, secondary) {
    }

    /** @returns {HTMLDialogElement} */
    getPrimary() {
    }

    /** @returns {HTMLDialogElement} */
    getSecondary() {
    }

    /**
     * Header with title and close button, plus the body. Replaces: shell().
     * @param {string} titleHtml  already escaped
     * @param {string} bodyHtml
     * @returns {string}
     */
    frame(titleHtml, bodyHtml) {
    }

    /**
     * Put HTML in a dialog and show it if it isn't open. Replaces: openD().
     * @param {HTMLDialogElement} dialog
     * @param {string} html
     */
    open(dialog, html) {
    }

    /** @param {HTMLDialogElement} dialog */
    close(dialog) {
    }

    /** Replaces: closeAllDialogs(). Tests: TC-LO-01. */
    closeAll() {
    }

    /**
     * Close a dialog when its backdrop is clicked.
     * @param {MouseEvent} event
     * @returns {boolean} true if the click was on a backdrop
     */
    handleBackdropClick(event) {
    }
}

/**
 * Toaster: short notifications at the bottom of the screen.
 * Layer: Presentation. Replaces: toast().
 * Tests: TC-CO-05 ("Check-out cancelled. Nothing was changed."), TC-CI-02.
 */
export class Toaster {
    /** @type {HTMLElement} the #toasts popover */
    #container;

    /** Milliseconds a toast stays up (prototype: 4000). */
    static DURATION_MS;

    /** @param {HTMLElement} container */
    constructor(container) {
    }

    /**
     * @param {string} message
     * @param {'info' | 'ok' | 'err'} [kind]
     */
    show(message, kind) {
    }
}
