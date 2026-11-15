/**
 * utils: small shared helpers (a module, not a class).
 * Replaces: $, esc, fmt, HR, DAY, fieldErr(), hazBadge().
 */

/** Milliseconds in an hour. */
export const HR = 36e5;

/** Milliseconds in a day. */
export const DAY = 864e5;

/**
 * Shorthand for querySelector. Replaces: $.
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {Element | null}
 */
export function $(selector, root) {
    return (root || document).querySelector(selector);
}

/**
 * Escape text before it goes into innerHTML, to prevent XSS. Replaces: esc.
 * @param {*} value
 * @returns {string}
 */
export function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    } [c]));
}

/**
 * Format a timestamp like "Nov 4, 2:18 PM". Replaces: fmt.
 * @param {number} timestamp
 * @returns {string}
 */
export function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

/**
 * Mark an input invalid and show its error text. Replaces: fieldErr().
 * Requirements: UI-9. Tests: TC-CI-03.
 * @param {string} inputId  error element is "e-" + inputId
 * @param {string} message
 */
export function showFieldError(inputId, message) {
    $('#' + inputId).setAttribute('aria-invalid', 'true');
    $('#e-' + inputId).textContent = message;
}

/**
 * HAZARDOUS or Standard badge HTML. Replaces: hazBadge().
 * Requirements: SA.2. Tests: TC-SF-05.
 * @param {import('./models/InventoryItem.js').InventoryItem} item
 * @returns {string}
 */
export function hazardBadge(item) {
    return item.isHazardous() ?
        '<span class="badge b-haz">HAZARDOUS</span>' :
        '<span class="badge b-std">Standard</span>';
}
