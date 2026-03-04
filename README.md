# @jsonfirst/sdk

Official JavaScript/Node.js SDK for the **JSONFIRST Protocol** — the Universal Intent Protocol for AI governance.

## Installation

```bash
npm install @jsonfirst/sdk
```

## Quick Start

```javascript
const JsonFirst = require('@jsonfirst/sdk');

const client = new JsonFirst({ apiKey: 'YOUR_API_KEY' });

// Parse a natural language intent
const result = await client.parse('Create a new order for John Smith, 2 units of product A');
console.log(result);

// Validate a JSONFIRST JSON
const { valid, errors } = client.validate(result);
console.log(valid, errors);
```

## Methods

| Method | Description |
|--------|-------------|
| `parse(text, options?)` | Convert natural language to JSONFIRST JSON |
| `validate(json)` | Validate a JSON against the JSONFIRST spec |
| `pull(schemaId)` | Fetch a publicly shared schema |
| `share(outputJson, title?)` | Share a schema and get a public link |
| `usage()` | Get your account usage stats |

## Options

```javascript
const client = new JsonFirst({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://jsonfirst.io' // optional override
});
```

## Links

- [Documentation](https://jsonfirst.io/developers)
- [Templates](https://jsonfirst.io/templates)
- [GitHub](https://github.com/jsonfirst/sdk)

## License

MIT
