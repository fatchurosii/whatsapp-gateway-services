const response = require('../utils/response.utils');

module.exports = (req, res, next) => {
  const rawToken = req.get('X-API-TOKEN');
  const token = typeof rawToken === 'string' ? rawToken.trim() : '';

  if (!token) {
    return response.UnauthorizedResponse(res, 'X-API-TOKEN header missing', { header: 'X-API-TOKEN' });
  }

  if (token !== process.env.API_TOKEN) {
    return response.ForbiddenResponse(res, 'Invalid API token');
  }

  return next();
};
