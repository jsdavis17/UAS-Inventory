import { Database } from '../data/Database.js';
import { InventoryService } from '../services/InventoryService.js';
import { $, esc, hazardBadge } from '../utils.js';

/**
 * InventoryView: the inventory table, stats line, search box and category filter.
 * Layer: Presentation.
 * Replaces: viewInventory(), renderList(), the clearInv action, the q and fcat
 * parts of onFilter(), ui.inv.
 * Requirements: UI-3, UI-5, FR-SF-1 to FR-SF-3.
 */
export class InventoryView {
    /** @type {HTMLElement} */
    #root;
    /** @type {Database} */
    #database;
    /** @type {InventoryService} */
    #inventoryService;
    /** @type {(itemId: number) => void} opens the item dialog */
    #onOpenItem;
    /** @type {{text: string, category: string}} */
    #filters;

    /**
     * @param {HTMLElement} root
     * @param {Database} database
     * @param {InventoryService} inventoryService
     * @param {(itemId: number) => void} onOpenItem
     */
    constructor(root, database, inventoryService, onOpenItem) {
        this.#root = root;
        this.#database = database;
        this.#inventoryService = inventoryService;
        this.#onOpenItem = onOpenItem;
        this.#filters = {
            text: '',
            category: ''
        };
    }

    /**
     * Draw the heading, stats, toolbar and list. Replaces: viewInventory().
     */
    render() {
        const f = this.#filters;

        this.#root.innerHTML = `
            <h1>Inventory</h1>
            <p class="stats" id="stats"></p>
            <form class="toolbar" role="search" data-noop="1">
                <div class="fld grow">
                    <label class="lbl" for="q">Search</label>
                    <input id="q" type="search" autocomplete="off" placeholder="Name or description" value="${esc(f.text)}">
                </div>
                <div class="fld">
                    <label class="lbl" for="fcat">Category</label>
                    <select id="fcat">
                        <option value="">All categories</option>
                        ${this.#database.getCategories().map(c => `
                            <option value="${esc(c)}" ${f.category === c ? 'selected' : ''}>${esc(c)}</option>
                        `).join('')}
                    </select>
                </div>
            </form>
            <div id="list"></div>
        `;

        this.renderList();
    }

    /**
     * Redraw only the stats line and the table. Replaces: renderList().
     * Rows with 0 available show Details instead of Check out.
     * Tests: TC-SF-01 to TC-SF-04, TC-CO-01, TC-CO-06, TC-CI-02.
     */
    renderList() {
        const stats = this.#database.getStats();
        $('#stats').textContent = stats.itemTypes + ' item types · ' +
            stats.unitsAvailable + ' units on the shelf · ' +
            stats.unitsCheckedOut + ' units checked out';

        const list = this.#inventoryService.search(this.#filters.text, this.#filters.category);

        if (!list.length) {
            this.renderEmpty();
            return;
        }

        $('#list').innerHTML = `
            <div class="tablewrap">
                <table class="tbl">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th class="num">Available</th>
                            <th>Hazard</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(item => {
                            const a = this.#database.getAvailableQuantity(item.getId());

                            return `
                                <tr>
                                    <td><button class="link" data-act="open" data-id="${item.getId()}">${esc(item.getName())}</button></td>
                                    <td>${esc(item.getCategory())}</td>
                                    <td>${esc(item.getLocation())}</td>
                                    <td class="num">${a} / ${item.getTotalQuantity()}</td>
                                    <td>${hazardBadge(item)}</td>
                                    <td>
                                        <button class="btn btn-sm" data-act="open" data-id="${item.getId()}">${a > 0 ? 'Check out' : 'Details'}</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * "No items found" panel that keeps the search text and category.
     * Requirements: FR-SF-3. Tests: TC-SF-04.
     */
    renderEmpty() {
        const text = this.#filters.text;

        $('#list').innerHTML = `
            <div class="empty">
                <h3>No items found</h3>
                <p class="muted">${text ? 'Nothing matches “' + esc(text) + '” with this category. ' : 'Nothing matches this category. '}Your search text and category are still set above.</p>
                <p style="margin-top:8px">
                    <button class="btn btn-sm" data-act="clearInv">Show all items</button>
                </p>
            </div>
        `;
    }

    /**
     * Fix defect D-01: call this from the input event only, never change.
     * Tests: TC-SF-01, TC-SF-02, TC-SF-04.
     * @param {string} text
     */
    setSearchText(text) {
        this.#filters.text = text;
        this.renderList();
    }

    /**
     * Tests: TC-SF-03.
     * @param {string} category
     */
    setCategory(category) {
        this.#filters.category = category;
        this.renderList();
    }

    /**
     * "Show all items": clear search and category. Replaces: the clearInv action.
     * Tests: TC-SF-04 (currently failing, defect D-01).
     */
    clearFilters() {
        this.#filters = {
            text: '',
            category: ''
        };
        this.render();
    }

    /**
     * Handle a click on a data-act button that belongs to this view
     * (open, clearInv).
     * @param {string} action
     * @param {HTMLElement} element
     * @returns {boolean} true if handled
     */
    handleAction(action, element) {
        if (action === 'open') {
            this.#onOpenItem(+element.dataset.id);
            return true;
        }

        if (action === 'clearInv') {
            this.clearFilters();
            return true;
        }

        return false;
    }

    /**
     * Handle input events from the search box and change events from the
     * category filter.
     * @param {Event} event
     * @returns {boolean} true if handled
     */
    handleInput(event) {
        const id = event.target.id;

        if (id === 'q' && event.type === 'input') {
            this.setSearchText(event.target.value);
            return true;
        }

        if (id === 'fcat' && event.type === 'change') {
            this.setCategory(event.target.value);
            return true;
        }

        return false;
    }
}
