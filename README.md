# @jsonfirst/sdk

**Stop writing brittle prompts.**
JSONFIRST turns any user input into a structured, validated JSON intent your agent can execute reliably.

```bash
npm install @jsonfirst/sdk
```

⭐ If this saves you time, star the repo: github.com/jsonfirst/sdk

---

## The problem it solves

**Without JSONFIRST** — your agent gets this:

```
"create an order for john, 2 units of product A, ship it fast"
```

Your code parses free text. Edge cases break it. You write regex. It still breaks.

**With JSONFIRST** — your agent gets this:

```json
{
  "spec": "JSONFIRST",
  "version": "2.0",
  "jdons": [{
    "action": { "normalized": "create" },
    "object": { "type": "order", "customer": "john", "quantity": 2, "product": "product_A" },
    "constraints": { "shipping": "express" },
    "execution": { "parsable": true, "executable": true }
  }]
}
```

Structured. Validated. Executable. Every time.

---

## Quick Start

**Step 1 — Get your API key at [jsonfirst.com/developers](https://jsonfirst.com/developers)**

**Step 2 — Install and parse**

```javascript
const JsonFirst = require('@jsonfirst/sdk');

const client = new JsonFirst({ apiKey: 'YOUR_API_KEY' });

const result = await client.parse('Create an order for John, 2 units of product A');
console.log(result.jdons[0].action.normalized); // "create"
console.log(result.jdons[0].object);            // { type: "order", ... }
```

---

## Methods

| Method | Description |
|--------|-------------|
| `parse(text, options?)` | Convert natural language to a validated JSONFIRST JSON |
| `validate(json)` | Validate a JSON against the JSONFIRST v2 spec |
| `validateIntent(intent, options?)` | Validate a single JDON intent (confidence, params, executability) |
| `pull(schemaId)` | Fetch a publicly shared schema |
| `share(outputJson, title?)` | Share a schema and get a public link |
| `usage()` | Get your account usage and remaining intents |
| `modes()` | List all 22 governance modes with metadata |
| `modeIds()` | List all 22 mode IDs as an array |

---

## Recoverable Agents — Full Pipeline

JSONFIRST closes the full loop: `intent → validation → snapshot → execution → receipt → rollback`

### 1. Snapshot (before execution)

```javascript
const snap = await client.snapshot({
  jdon_id: 'jdon_abc123',
  description: 'before delete user 1234',
  state: { user_id: '1234', status: 'active', balance: 500 },
  rollback_webhook: 'https://yourapp.com/webhooks/rollback' // optional
});
// → { snapshot_id: 'uuid', status: 'AVAILABLE' }
```

### 2. Receipt (after execution — verify intent match)

```javascript
const receipt = await client.receipt({
  jdon_id: 'jdon_abc123',
  output_summary: 'User 1234 deleted from production database',
  mode: 'PRODUCTION_LOCK',
  original_intent: result  // the JSONFIRST parse output
});
// → { intent_match_score: 0.95, verification_status: 'VERIFIED', drift_detected: false }
// or → { verification_status: 'INTENT_MISMATCH', flags: ['ROLLBACK_SUGGESTED'] }
```

### 3. Rollback (if drift detected)

```javascript
if (receipt.receipt.flags.includes('ROLLBACK_SUGGESTED')) {
  const rb = await client.rollback({
    snapshot_id: snap.snapshot_id,
    reason: 'INTENT_MISMATCH_DETECTED'
  });
  // → { status: 'ROLLED_BACK', restored_state: { user_id: '1234', ... } }
  // Webhook fired automatically if configured
}
```

---

## Governance Modes

22 modes ship with this SDK. Pass `execution_mode` to `parse()` to activate.

```javascript
const result = await client.parse('Delete user 1234', {
  execution_mode: 'GUARDIAN_MODE' // blocks risky actions until confirmed
});

console.log(JsonFirst.MODE_IDS); // all 22 mode IDs
```

| Mode | Plan | Category |
|------|------|----------|
| `ANTI_CREDIT_WASTE_V2` | free+ | efficiency |
| `EXPRESS_ROUTE` | explorer+ | speed |
| `STRICT_PROTOCOL` | explorer+ | compliance |
| `PERFORMANCE_MAX` | explorer+ | performance |
| `GUARDIAN_MODE` | explorer+ | safety |
| `FINANCE_ALGO` | explorer+ | finance |
| `ETHICAL_LOCK` | explorer+ | ethics |
| `SCOPE_LIMITER` | pro+ | governance |
| `SAFE_DEPLOY` | pro+ | deployment |
| `STANDARD_DEPLOY` | pro+ | deployment |
| `FAST_BUILD` | pro+ | build |
| `PRODUCTION_LOCK` | pro+ | deployment |
| `MEDICAL_EXPERT` | business+ | domain_lock |
| `LEGAL_EXPERT` | business+ | domain_lock |
| `FINANCE_EXPERT` | business+ | domain_lock |
| `CYBERSECURITY_EXPERT` | business+ | domain_lock |
| `SOFTWARE_ENGINEERING_EXPERT` | business+ | domain_lock |
| `AI_RESEARCH_EXPERT` | business+ | domain_lock |
| `NEWS_ANALYSIS_EXPERT` | business+ | domain_lock |
| `SCIENTIFIC_RESEARCH_EXPERT` | business+ | domain_lock |
| `BUSINESS_STRATEGY_EXPERT` | business+ | domain_lock |
| `DATA_SCIENCE_EXPERT` | business+ | domain_lock |

---

## Works with

- **LangChain** — use JSONFIRST to parse user inputs before passing structured intents to your chains
- **LlamaIndex** — feed validated JDON objects as structured queries to your indexes and agents
- **CrewAI** — turn natural language tasks into executable JDONs your crew agents can act on reliably
- **Any LLM** — framework-agnostic, works with OpenAI, Anthropic, Gemini, Mistral, and any model

---

## Links

- [Get your API key](https://jsonfirst.com/developers)
- [Documentation](https://jsonfirst.com/developers)
- [LLM Implants](https://www.npmjs.com/package/@jsonfirst/implants)
- [GitHub](https://github.com/jsonfirst/sdk)
- [Protocol spec](https://jsonfirst.com)

## License

MIT
