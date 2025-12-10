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
