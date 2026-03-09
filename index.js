/**
 * @jsonfirst/sdk v1.2.0
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

  // All 22 governance modes
  const MODES = {
    // Base modes (all plans)
    ANTI_CREDIT_WASTE_V2:        { plan: 'free+',     category: 'efficiency',  description: 'Anti-token-waste enforcement. Minimal, direct, single-pass.' },
    EXPRESS_ROUTE:               { plan: 'explorer+', category: 'speed',       description: 'Ultra-low latency routing. Fastest path to response.' },
    STRICT_PROTOCOL:             { plan: 'explorer+', category: 'compliance',  description: 'Enforces strict JSONFIRST spec compliance on all outputs.' },
    PERFORMANCE_MAX:             { plan: 'explorer+', category: 'performance', description: 'Maximum throughput. Optimized for high-volume workloads.' },
    GUARDIAN_MODE:               { plan: 'explorer+', category: 'safety',      description: 'Safety lock. Blocks risky actions until explicit confirmation.' },
    FINANCE_ALGO:                { plan: 'explorer+', category: 'finance',     description: 'Financial computation mode. Precision over speed.' },
    ETHICAL_LOCK:                { plan: 'explorer+', category: 'ethics',      description: 'Ethics enforcement. Refuses harmful or biased outputs.' },
    SCOPE_LIMITER:               { plan: 'pro+',      category: 'governance',  description: 'Restricts agent scope to explicitly defined boundaries.' },
    SAFE_DEPLOY:                 { plan: 'pro+',      category: 'deployment',  description: 'Deployment gating. Requires validation before any deploy.' },
    STANDARD_DEPLOY:             { plan: 'pro+',      category: 'deployment',  description: 'Standard deployment flow with audit trail.' },
    FAST_BUILD:                  { plan: 'pro+',      category: 'build',       description: 'Accelerated build mode. Speed-first, reduced validation.' },
    PRODUCTION_LOCK:             { plan: 'pro+',      category: 'deployment',  description: 'Production environment lock. No destructive actions.' },
    // Domain Lock modes (business/enterprise)
    MEDICAL_EXPERT:              { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to medicine. Refuses off-domain queries.' },
    LEGAL_EXPERT:                { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to law and legal compliance.' },
    FINANCE_EXPERT:              { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to financial analysis and accounting.' },
    CYBERSECURITY_EXPERT:        { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to cybersecurity and threat analysis.' },
    SOFTWARE_ENGINEERING_EXPERT: { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to software engineering and architecture.' },
    AI_RESEARCH_EXPERT:          { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to AI/ML research and model analysis.' },
    NEWS_ANALYSIS_EXPERT:        { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to news analysis and geopolitics.' },
    SCIENTIFIC_RESEARCH_EXPERT:  { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to scientific research and methodology.' },
    BUSINESS_STRATEGY_EXPERT:    { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to business strategy and market analysis.' },
    DATA_SCIENCE_EXPERT:         { plan: 'business+', category: 'domain_lock', description: 'Domain-locked to data science and analytics.' },
  };

  const MODE_IDS = Object.keys(MODES);

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
     * Validate a JSONFIRST output JSON against the JSONFIRST v2 spec.
     * @param {Object} json - The JSONFIRST JSON to validate
     * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
     */
    validate(json) {
      const errors = [];
      const warnings = [];
      if (!json || typeof json !== 'object') {
        return { valid: false, errors: ['Input must be a JSON object'], warnings: [] };
      }
      if (json.spec !== 'JSONFIRST') errors.push('Missing or incorrect "spec" field (expected "JSONFIRST")');
      if (!json.version) errors.push('Missing "version" field');
      if (!json.jdons || !Array.isArray(json.jdons)) {
        errors.push('Missing "jdons" array');
      } else if (json.jdons.length === 0) {
        warnings.push('"jdons" array is empty — no intents parsed');
      }
      if (!json.execution || typeof json.execution !== 'object') errors.push('Missing "execution" object');
      return { valid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate a single JDON intent for completeness and executability.
     * Checks required params, confidence threshold, and executable flag.
     * @param {Object} intent - A single JDON object from jdons[]
     * @param {Object} [options]
     * @param {number} [options.minConfidence=0.5] - Minimum confidence threshold (0-1)
     * @param {string[]} [options.requiredParams=[]] - List of required param keys in intent.object
     * @returns {{ valid: boolean, executable: boolean, missing_params: string[], errors: string[], confidence: number }}
     */
    validateIntent(intent, options = {}) {
      const { minConfidence = 0.5, requiredParams = [] } = options;
      const errors = [];
      const missing_params = [];

      if (!intent || typeof intent !== 'object') {
        return { valid: false, executable: false, missing_params: [], errors: ['Intent must be a JSON object'], confidence: 0 };
      }

      // Action check
      if (!intent.action || !intent.action.normalized) errors.push('Missing action.normalized');

      // Confidence check
      const confidence = intent.confidence || 0;
      if (confidence < minConfidence) {
        errors.push(`Confidence ${(confidence * 100).toFixed(0)}% is below minimum ${(minConfidence * 100).toFixed(0)}%`);
      }

      // Required params check
      const obj = intent.object || {};
      for (const param of requiredParams) {
        if (obj[param] === undefined || obj[param] === null) {
          missing_params.push(param);
          errors.push(`Missing required param: ${param}`);
        }
      }

      // Missing params from JSONFIRST spec
      if (intent.missing_params && intent.missing_params.length > 0) {
        for (const p of intent.missing_params) {
          if (!missing_params.includes(p)) missing_params.push(p);
        }
      }

      const executable = intent.executable === true && missing_params.length === 0 && errors.length === 0;

      return { valid: errors.length === 0, executable, missing_params, errors, confidence };
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

    /**
     * List all 22 governance modes with their metadata.
     * @returns {Object} modes map
     */
    modes() {
      return MODES;
    }

    /**
     * List all mode IDs.
     * @returns {string[]}
     */
    modeIds() {
      return MODE_IDS.slice();
    }
  }

  JsonFirst.MODES   = MODES;
  JsonFirst.MODE_IDS = MODE_IDS;

  return JsonFirst;
}));
