// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: (isProd && statusCode === 500) ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
  });
};

module.exports = errorHandler;
