const db = require('../models');
const responseUtils = require('../utils/response.utils');

exports.getUserPaginated = async (req, res) => {
  try {
    const pRaw = req.query.p ?? 1;
    const lRaw = req.query.l ?? 10;
    const sortRaw = req.query.sort ?? 'id';
    const orderRaw = req.query.order ?? 'DESC';

    const page = Math.max(parseInt(pRaw, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(lRaw, 10) || 10, 1), 100); 
    const offset = (page - 1) * limit;

    const ALLOWED_SORT_FIELDS = ['id', 'username']; 
    const sort = ALLOWED_SORT_FIELDS.includes(sortRaw) ? sortRaw : 'id';

    const order = String(orderRaw).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await db.User.findAndCountAll({
      offset,
      limit,
      order: [[sort, order]],
    });

    const total = result.count || 0;
    const totalPages = Math.ceil(total / limit);

    const data = {
      data : result.rows,
      meta : {
        page,
        limit,
        total,
        totalPages,
        sort,
        order,
      }
    };

    return responseUtils.PaginatedResponse(res, 'Data User successfully retrieved', data);
  } catch (err) {
    console.error('[getUserPaginated] Error', err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
};
