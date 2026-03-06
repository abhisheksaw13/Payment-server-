const { v4: uuidv4 } = require('uuid');

/**
 * Generate a prefixed, URL-safe unique identifier.
 * @param {string} prefix  e.g. 'order', 'cust', 'txn'
 * @returns {string}
 */
const generateId = (prefix) =>
  `${prefix}_${uuidv4().replace(/-/g, '').substring(0, 20)}`;

module.exports = { generateId };
