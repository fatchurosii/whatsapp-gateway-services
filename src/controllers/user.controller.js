const db = require('../models');
const { getPaginationParams, buildPaginationMeta } = require('../utils/paginate.utils');
const responseUtils = require('../utils/response.utils');

exports.getUserPaginated = async (req, res) => {
  try {
    const { page, limit, offset, sort, order } = getPaginationParams(req.query, {
      allowedSortFields: ['id', 'username'],
      defaultSort: 'id',
    });

    const result = await db.User.findAndCountAll({
      offset,
      limit,
      order: [[sort, order]],
    });

    const meta = {
      ...buildPaginationMeta({
        page,
        limit,
        total: result.count,
        sort,
        order,
      }),
    };

    return responseUtils.PaginatedResponse(
      res,
      'Data User successfully retrieved',
      result.rows,
      meta
    );
  } catch (err) {
    console.error('[getUserPaginated] Error', err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
};
