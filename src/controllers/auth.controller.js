const db = require('../models');
const jwtService = require('../services/jwt.service');
const responseUtils = require('../utils/response.utils');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return responseUtils.BadRequestResponse(res, "username and password are required")
  }

  try {
    const existingUser = await db.User.findOne({ where: { username } });
    
    if(existingUser){
      return responseUtils.BadRequestResponse(res, 'Username already exists')
    }    

    const user = await db.User.create({ username,  password });
    const token = jwtService.sign({ id: user.id, username: user.username });
    return responseUtils.SuccessResponse(res,'User registered successfully', {data: user, token});
  } catch (err) {
    console.error("[Register] Errror", err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return responseUtils.BadRequestResponse(res, 'Username and password are required');

  try {
    const user = await db.User.findOne({ where: { username }});
    if (!user) {
      return responseUtils.NotFoundResponse(res, 'User not found!');
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return responseUtils.UnauthorizedResponse(res, 'Invalid credentials!');
    }

    const token = jwtService.sign({ id: user.id, username: user.username });
    return responseUtils.SuccessResponse(res,'User Login successfully', {data: user, token});
  } catch (err) {
    console.log("[Login] error", err)
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
};
