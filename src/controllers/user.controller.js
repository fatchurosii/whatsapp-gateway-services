const db = require('../models');
const responseUtils = require('../utils/response.utils');

exports.getUserPaginated() = async (req, res) => {
  
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try{
    
    const users = await db.User.findAll({ offset, limit });
    
    return responseUtils.SuccessResponse(res,'Users Paginated successfully', users);
    
  }catch(err){
    console.error("[getUserPaginated] Error", err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}
