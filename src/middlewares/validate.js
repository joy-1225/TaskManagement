const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: (err.errors || err.issues || []).map(e => ({
          field: (e.path && e.path.length > 0) ? e.path.join('.') : 'unknown',
          message: e.message
        }))
      });
    }
    next(err);
  }
};

module.exports = validate;
