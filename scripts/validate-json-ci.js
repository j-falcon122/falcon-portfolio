#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const file = path.resolve(__dirname, '../content/mock/pages.json');
if (!fs.existsSync(file)) {
  console.error('Missing file:', file);
  process.exit(2);
}

const raw = fs.readFileSync(file, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('Invalid JSON:', err.message);
  process.exit(1);
}

const schema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['slug', 'blocks'],
    properties: {
      slug: { type: 'string' },
      title: { type: 'string' },
      blocks: {
        type: 'array',
        items: {
          type: 'object',
          required: ['_type'],
          properties: {
            _type: { type: 'string' }
          }
        }
      }
    }
  }
};

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(data);
if (!valid) {
  console.error('pages.json schema validation failed:');
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}
console.log('pages.json is valid and matches schema');
