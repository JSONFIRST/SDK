/**
 * @jsonfirst/sdk v1.0.0
 * Official JavaScript/Node.js SDK for the JSONFIRST Protocol
 *
 * Usage:
 *   const JsonFirst = require('@jsonfirst/sdk');
 *   const client = new JsonFirst({ apiKey: 'YOUR_API_KEY' });
 *   const result = await client.parse('Create a new order for John Smith');
 *
 * Install:
 *   npm install @jsonfirst/sdk
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.JsonFirst = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function() {

  const DEFAULT_BASE_URL = 'https://jsonfirst.com';

  class JsonFirstError extends Error {
    constructor(message, status, body) {
      super(message);
      this.name = 'JsonFirstError';
      this.status = status;
      this.body = body;
    }
  }

  class JsonFirst {
    /**
     * @param {Object} options
     * @param {string} options.apiKey - Your JSONFIRST API key
     * @param {string} [options.baseUrl] - Override base URL (default: https://jsonfirst.com)
     */
    constructor(options = {}) {
      if (!options.apiKey) throw new Error('JsonFirst: apiKey is required');
      this.apiKey = options.apiKey;
      this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    }

    _headers() {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      };
    }

    async _request(method, path, body) {
      const url = `${this.baseUrl}/api${path}`;
      const res = await fetch(url, {
        method,
        headers: this._headers(),
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new JsonFirstError(data.detail || 'Request failed', res.status, data);
      return data;
    }

    /**
     * Parse a natural language intent into a JSONFIRST JSON.
     * @param {string} text - The intent to parse
     * @param {Object} [options] - Optional params: model, execution_mode
     * @returns {Promise<Object>} JSONFIRST JSON output
     */
    async parse(text, options = {}) {
      return this._request('POST', '/parse', { input: text, ...options });
    }

    /**
     * Pull a publicly shared schema by its share ID.
     * @param {string} schemaId - The share ID (e.g. "abc123xy")
     * @returns {Promise<Object>} Schema object
     */
    async pull(schemaId) {
      if (!schemaId) throw new Error('pull: schemaId is required');
      const res = await fetch(`${this.baseUrl}/api/schemas/public/${schemaId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new JsonFirstError(data.detail || 'Schema not found', res.status, data);
      return data;
    }

    /**
     * Validate a JSON object against the JSONFIRST spec.
     * @param {Object} json - The JSON to validate
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validate(json) {
      const errors = [];
      if (!json || typeof json !== 'object') {
        return { valid: false, errors: ['Input must be a JSON object'] };
      }
      if (json.spec !== 'JSONFIRST') errors.push('Missing or incorrect "spec" field (expected "JSONFIRST")');
      if (!json.version) errors.push('Missing "version" field');
      if (!json.jdons || !Array.isArray(json.jdons)) errors.push('Missing "jdons" array');
      if (!json.execution || typeof json.execution !== 'object') errors.push('Missing "execution" object');
      return { valid: errors.length === 0, errors };
    }

    /**
     * Share a schema output and get a public link.
     * @param {Object} outputJson - The JSONFIRST JSON to share
     * @param {string} [title] - Optional title
     * @returns {Promise<{ share_id: string, url: string }>}
     */
    async share(outputJson, title) {
      return this._request('POST', '/schemas/share', { output_json: outputJson, title: title || 'Shared Schema' });
    }

    /**
     * Get your account usage and remaining intents.
     * @returns {Promise<Object>}
     */
    async usage() {
      return this._request('GET', '/auth/me');
    }
  }

  return JsonFirst;
}));
