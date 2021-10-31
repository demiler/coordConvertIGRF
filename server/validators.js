const { validator } = require('@exodus/schemasafe')

const nteValidator = validator({
  type: 'object',
  required: ['date', 'time', 'norad', 'filters'],
  properties: {
    date:    { type: 'array', minItems: 2, maxItems: 2, items: { type: 'string', format: 'date' }},
    time:    { type: 'array', minItems: 2, maxItems: 2, items: {
      type: 'string',
      pattern: '^((2[0-3]|[0-1]\\d):[0-5]\\d:[0-5]\\d|23:59:60)$',
    }},
    norad:   { type: 'number', },
    filters: { type: 'array', minItems: 1, items: { type: 'string' }},
  }
}, { includeErrors: true });

const gteValidator = validator({
  type: 'object',
  required: ['coord', 'geod', 'date', 'time', 'filters'],
  properties: {
    coord:   { type: 'array', minItems: 3, maxItems: 3, items: { type: 'number' }},
    geod:    { type: 'boolean' },
    date:    { type: 'string', format: 'date', },
    time:    { type: 'string', pattern: '^((2[0-3]|[0-1]\\d):[0-5]\\d:[0-5]\\d|23:59:60)$' },
    filters: { type: 'array', minItems: 1, items: { type: 'string' }},
  }
}, { includeErrors: true });

module.exports = { gteValidator, nteValidator };
