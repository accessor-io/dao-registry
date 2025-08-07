const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJsonSchema(schemaName) {
  const schemaPath = path.join(process.cwd(), 'shared', 'schemas', `${schemaName}.schema.json`);
  if (!fs.existsSync(schemaPath)) return null;
  try {
    const raw = fs.readFileSync(schemaPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function validateWithSchema(schemaName, data) {
  const schema = loadJsonSchema(schemaName);
  if (!schema) return { valid: true, errors: [] };
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid, errors: validate.errors || [] };
}

/**
 * Middleware to validate request data against a Joi schema and/or JSON Schema (Ajv)
 * @param {Object} schema - Joi validation schema (optional)
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @param {string} schemaName - Optional JSON Schema name to validate with Ajv
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema, property = 'body', schemaName = null) => {
  return (req, res, next) => {
    let data = req[property];

    // First, JSON Schema validation if provided
    if (schemaName) {
      const { valid, errors } = validateWithSchema(schemaName, data);
      if (!valid) {
        return res.status(400).json({
          success: false,
          error: 'Schema validation failed',
          details: errors.map(e => `${e.instancePath || e.schemaPath} ${e.message}`).join(', ')
        });
      }
    }

    // Then, Joi validation if schema provided
    if (schema) {
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errorMessage
        });
      }

      // Replace the request property with validated data
      req[property] = value;
    }

    next();
  };
};

module.exports = {
  validateRequest
}; 