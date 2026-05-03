const { ZodError } = require('zod');

/**
 * Middleware factory that validates req.body against a given Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: err.errors ? err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })) : [{ message: err.message || 'Invalid input data' }],
      });
    }
    next(err);
  }
};

module.exports = validate;
