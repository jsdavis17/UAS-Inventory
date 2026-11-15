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
        this.#primary = primary;
        this.#secondary = secondary;
    }

    /** @returns {HTMLDialogElement} */
    getPrimary() {
        return this.#primary;
    }

    /** @returns {HTMLDialogElement} */
    getSecondary() {
        return this.#secondary;
    }

    /**
     * Header with title and close button, plus the body. Replaces: shell().
     * @param {string} titleHtml  already escaped
     * @param {string} bodyHtml
     * @returns {string}
     */
    frame(titleHtml, bodyHtml) {
        return `
            <div class="dlg-hd">
                <h2 id="dlgTitle">${titleHtml}</h2>
                <button class="xbtn" type="button" data-act="closedlg" aria-label="Close">×</button>
            </div>
            <div class="dlg-bd">${bodyHtml}</div>
        `;
    }

    /**
     * Put HTML in a dialog and show it if it isn't open. Replaces: openD().
     * @param {HTMLDialogElement} dialog
     * @param {string} html
     */
    open(dialog, html) {
        dialog.innerHTML = html;

        if (!dialog.open) {
            dialog.showModal();
        }
    }

    /** @param {HTMLDialogElement} dialog */
    close(dialog) {
        dialog.close();
    }

    /** Replaces: closeAllDialogs(). Tests: TC-LO-01. */
    closeAll() {
        this.#secondary.close();
        this.#primary.close();
    }

    /**
     * Close a dialog when its backdrop is clicked.
     * @param {MouseEvent} event
     * @returns {boolean} true if the click was on a backdrop
     */
    handleBackdropClick(event) {
        if (event.target === this.#primary || event.target === this.#secondary) {
            event.target.close();
            return true;
        }

        return false;
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
    static DURATION_MS = 4000;

    /** @param {HTMLElement} container */
    constructor(container) {
        this.#container = container;
    }

    /**
     * @param {string} message
     * @param {'info' | 'ok' | 'err'} [kind]
     */
    show(message, kind) {
        const toast = document.createElement('div');
        toast.className = 'toast ' + (kind || 'info');
        toast.textContent = message;
        this.#container.appendChild(toast);

        if (!this.#container.matches(':popover-open')) {
            this.#container.showPopover();
        }

        setTimeout(() => {
            toast.remove();

            if (!this.#container.children.length) {
                this.#container.hidePopover();
            }
        }, Toaster.DURATION_MS);
    }
}
