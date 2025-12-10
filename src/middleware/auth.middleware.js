
const jwtService = require('../services/jwt.service');
const db = require('../models');
const responseUtils = require('../utils/response.utils');

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return responseUtils.UnauthorizedResponse(res, 'Authorization token missing')
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwtService.verify(token);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return responseUtils.UnauthorizedResponse(res, 'Token is invalid')
    req.user = user;
    next();
  } catch (err) {
    return responseUtils.UnauthorizedResponse(res, 'Invalid or expired token')
  }
};
