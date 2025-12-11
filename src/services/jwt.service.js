const jwt = require('jsonwebtoken');
const config = require('../../config/app.config.js');

function sign(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function verify(token) {
  return jwt.verify(token, config.jwt.secret);
}

function destroyToken(user) {
  user.token = null;
  return user.save();
}

module.exports = { sign, verify, destroyToken };
