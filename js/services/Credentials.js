/**
 * Credentials: the rules for usernames (ERAU Student IDs) and passwords.
 * Layer: Business. New. Pure functions: no DOM, no database, so the same rules
 * can run in Database.addUser(), the login form and any future sign-up form.
 *
 * Username: exactly 7 digits, kept as a string so leading zeros survive.
 * Password: see PASSWORD_RULES. Change the policy by editing that list.
 *
 * Hashing: bcrypt, via bcrypt.js (index.html loads it, defining the dcodeIO.bcrypt
 * global). Only the bcrypt hash is stored; the salt is built into the hash string.
 * The sync API is used, so Session.login() stays synchronous; one hash or compare
 * at BCRYPT_COST takes roughly 100 ms in a browser.
 */

/** bcrypt work factor: each +1 doubles the time to hash and to guess. */
export const BCRYPT_COST = 10;

/** bcrypt only reads the first 72 bytes of a password, so longer ones are refused. */
export const PASSWORD_MAX_BYTES = 72;

/** Exactly seven digits, nothing else. */
const STUDENT_ID_PATTERN = /^\d{7}$/;

/** Shortest password allowed. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Every rule a new password must pass. Each has a message shown when it fails.
 * @type {{message: string, test: (password: string, studentId: string) => boolean}[]}
 */
export const PASSWORD_RULES = [{
        message: `At least ${PASSWORD_MIN_LENGTH} characters.`,
        test: pw => pw.length >= PASSWORD_MIN_LENGTH
    },
    {
        message: `At most ${PASSWORD_MAX_BYTES} characters.`,
        test: pw => new TextEncoder().encode(pw).length <= PASSWORD_MAX_BYTES
    },
    {
        message: 'At least one uppercase letter (A-Z).',
        test: pw => /[A-Z]/.test(pw)
    },
    {
        message: 'At least one lowercase letter (a-z).',
        test: pw => /[a-z]/.test(pw)
    },
    {
        message: 'At least one number (0-9).',
        test: pw => /\d/.test(pw)
    },
    {
        message: 'At least one symbol, such as ! @ # $ %.',
        test: pw => /[^A-Za-z0-9\s]/.test(pw)
    },
    {
        message: 'No spaces.',
        test: pw => !/\s/.test(pw)
    },
    {
        message: 'Must not contain your Student ID.',
        test: (pw, studentId) => !studentId || !pw.includes(studentId)
    }
];

/**
 * @param {string} studentId
 * @returns {boolean} true when the ID is exactly 7 digits
 */
export function isValidStudentId(studentId) {
    return typeof studentId === 'string' && STUDENT_ID_PATTERN.test(studentId);
}

/**
 * @param {string} studentId
 * @returns {string | null} an error message, or null when the ID is fine
 */
export function validateStudentId(studentId) {
    if (!studentId) {
        return 'Enter a Student ID.';
    }
    return isValidStudentId(studentId) ? null : 'Student ID must be exactly 7 digits.';
}

/**
 * Check a new password against every rule.
 * @param {string} password
 * @param {string} [studentId]  so the password can't contain the ID
 * @returns {string[]} the message of each failed rule; empty when the password passes
 */
export function validatePassword(password, studentId = '') {
    const pw = typeof password === 'string' ? password : '';
    return PASSWORD_RULES.filter(rule => !rule.test(pw, studentId)).map(rule => rule.message);
}

/** @returns {typeof import('bcryptjs')} */
function bcrypt() {
    const lib = globalThis.dcodeIO && globalThis.dcodeIO.bcrypt;
    if (!lib) {
        throw new Error('bcrypt.js is not loaded. Add the bcrypt.min.js script tag to '
            + 'index.html before js/Main.js.');
    }
    return lib;
}

/**
 * Hash a password with a new random salt.
 * @param {string} password
 * @returns {string} a bcrypt hash such as "$2a$10$..."
 */
export function hashPassword(password) {
    return bcrypt().hashSync(password, BCRYPT_COST);
}

/**
 * @param {string} password  what the user typed
 * @param {string} hash      the stored bcrypt hash
 * @returns {boolean} true when the password matches
 */
export function verifyPassword(password, hash) {
    return isPasswordHash(hash) && bcrypt().compareSync(password, hash);
}

/** Hash used by burnPasswordCheck(). @type {string | null} */
let dummyHash = null;

/**
 * Build the dummy hash ahead of time (Session's constructor calls this), so even
 * the first failed login doesn't pay for an extra hash and stand out by timing.
 */
export function prepareDummyHash() {
    dummyHash = dummyHash || hashPassword('not-a-real-password');
}

/**
 * Run a compare that always fails. Used when a Student ID doesn't exist, so a
 * wrong ID takes as long as a wrong password and the timing doesn't reveal which
 * IDs are real.
 * @param {string} password
 */
export function burnPasswordCheck(password) {
    prepareDummyHash();
    bcrypt().compareSync(password, dummyHash);
}

/**
 * @param {string} value
 * @returns {boolean} true when value looks like a bcrypt hash rather than plain text
 */
export function isPasswordHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}
