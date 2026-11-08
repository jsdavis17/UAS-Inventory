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
}

/**
 * Escape text before it goes into innerHTML, to prevent XSS. Replaces: esc.
 * @param {*} value
 * @returns {string}
 */
export function esc(value) {
}

/**
 * Format a timestamp like "Nov 4, 2:18 PM". Replaces: fmt.
 * @param {number} timestamp
 * @returns {string}
 */
export function formatTime(timestamp) {
}

/**
 * Mark an input invalid and show its error text. Replaces: fieldErr().
 * Requirements: UI-9. Tests: TC-CI-03.
 * @param {string} inputId  error element is "e-" + inputId
 * @param {string} message
 */
export function showFieldError(inputId, message) {
}

/**
 * HAZARDOUS or Standard badge HTML. Replaces: hazBadge().
 * Requirements: SA.2. Tests: TC-SF-05.
 * @param {import('./models/InventoryItem.js').InventoryItem} item
 * @returns {string}
 */
export function hazardBadge(item) {
}
