const db = require('../models');
const whatsappService = require('../services/whatsapp.service');
const responseUtils = require('../utils/response.utils');

async function status(req, res) {
  try {
    const clientId = req.body.clientId;
    if (!clientId) return responseUtils.BadRequestResponse(res, 'ClientId is required');
    const st = whatsappService.getStatus(clientId);
    if(!st.exists){
      return responseUtils.NotFoundResponse(res, 'Client not found');
    }
    return responseUtils.SuccessResponse(res)
  } catch (err) {
    console.error('[CONTROLLER] status error', err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}

async function qr(req, res) {
  try {
    const clientId = req.body.clientId;
    if (!clientId) return responseUtils.BadRequestResponse(res, 'ClientId is required');
    
    const device = await db.Device.findOne({
      where: {
        deviceKey: clientId
      }
    })
    
    if (!device) return responseUtils.NotFoundResponse(res, 'Device not found');
    
    const deviceKey = device?.deviceKey ? device.deviceKey : null;
    
    if(!deviceKey) return responseUtils.BadRequestResponse(res, 'Device key is required');
    
    const client = await whatsappService.getClient(deviceKey);
    
    if(!client){
      await whatsappService.createClient(deviceKey);
    }
    
    const dataUrl = await whatsappService.getQrImage(deviceKey);
    
    const resData = {
      dataUrl,
      device
    }
    return responseUtils.SuccessResponse(res, "Qr Berhasil ditampilkan", resData);
    
  } catch (err) {
    console.error('[CONTROLLER] qr error', err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}

// async function sendMessage(req, res) {
//   try {
//     const { clientId, number, message } = req.body;
//     if (!clientId || !number || !message) return res.status(400).json({ error: 'clientId, number and message required' });
//     const sent = await whatsappService.sendMessage(clientId, number, message);
//     res.json({ success: true, id: sent.id.id, timestamp: sent.timestamp });
//   } catch (err) {
//     console.error('[CONTROLLER] sendMessage error', err);
//     res.status(500).json({ error: err.message });
//   }
// }

// async function logout(req, res) {
// try {
//   const clientId = req.body.clientId;
//     if (!clientId) return res.status(400).json({ error: 'clientId required' });
//     await whatsappService.resetClient(clientId, 'manual_logout');
//     res.json({ success: true, clientId });
//   } catch (err) {
//     console.error('[CONTROLLER] logout error', err);
//     res.status(500).json({ error: err.message });
//   }
// }

module.exports = {status, qr};