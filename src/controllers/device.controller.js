const responseUtils = require('../utils/response.utils');
const db = require('../models');
const whatsappService = require('../services/whatsapp.service');


exports.store = async (req, res) => {
  const { name, whatsappNumber } = req.body;
  const nameTrim = typeof name === 'string' ? name.trim() : '';
  const whatsappNumberTrim = typeof whatsappNumber === 'string' ? whatsappNumber.trim() : '';
  
  if (!nameTrim || !whatsappNumberTrim) {
    return responseUtils.BadRequestResponse(res, 'Name and whatsappNumber are required');
  }

  try {
    const existingWhatsappNumber = await db.Device.findOne({ where: { whatsapp_number: whatsappNumberTrim } });
    if (existingWhatsappNumber) {
      return responseUtils.BadRequestResponse(res, 'whatsappNumber already exists');
    }
    
    const existingName = await db.Device.findOne({ where: { name: nameTrim } });
    if (existingName) {
      return responseUtils.BadRequestResponse(res, 'Name already exists');
    }
    const device = await db.Device.create({ name: nameTrim, whatsapp_number: whatsappNumberTrim });

    
    return responseUtils.SuccessResponse(res, 'Device registered successfully', device );
  } catch (err) {
    console.error(err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
};

exports.getDevicePaginated = async (req, res) => {
  try {
    const pRaw = req.query.p ?? 1;
    const lRaw = req.query.l ?? 10;
    const sortRaw = req.query.sort ?? 'id';
    const orderRaw = req.query.order ?? 'DESC';

    const page = Math.max(parseInt(pRaw, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(lRaw, 10) || 10, 1), 100); 
    const offset = (page - 1) * limit;

    const ALLOWED_SORT_FIELDS = ['id', 'name', 'whatsapp_number']; 
    const sort = ALLOWED_SORT_FIELDS.includes(sortRaw) ? sortRaw : 'id';

    const order = String(orderRaw).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await db.Device.findAndCountAll({
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

    return responseUtils.PaginatedResponse(res, 'Data Device successfully retrieved', data);
  } catch (err) {
    console.error('[getDevicePaginated] Error', err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
};
