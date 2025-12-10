
const db = require('../models');
const responseUtils = require('../utils/response.utils');


exports.store = async (req, res) => {
  const { name, whatsappNumber } = req.body;
  const nameTrim = typeof name === 'string' ? name.trim() : '';
  const whatsappNumberTrim = typeof whatsappNumber === 'string' ? whatsappNumber.trim() : '';
  
  if (!nameTrim || !whatsappNumberTrim) {
    return responseUtils.BadRequestResponse(res, 'Name and whatsappNumber are required');
  }

  try {
    
    const existingWhatsappNumberNumber = await db.Device.findOne({ where: { whatsapp_number: whatsappNumberTrim } });
    if (existingWhatsappNumberNumber) {
      return responseUtils.BadRequestResponse(res, 'whatsappNumber number already exists');
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

// exports.updateDeviceId = async (req, res) => {
//   const { id } = req.params;
//   const { deviceId } = req.body;

//   if (!deviceId) {
//     return responseUtils.sendRes(res, responseUtils.error(null, 'Device ID is required', 400));
//   }

//   try {
//     const device = await db.Device.findOne({
//       where: { id }
//     });

//     if (!device) {
//       return responseUtils.sendRes(res, responseUtils.error(null, 'Device not found', 404));
//     }

//     device.deviceId = deviceId;
//     await device.save();

//     return responseUtils.sendRes(res, responseUtils.success(device, 'Device ID updated successfully', 200));
//   } catch (err) {
//     console.error(err);
//     return responseUtils.sendRes(res, responseUtils.error(null, 'Server error', 500));
//   }
// };
