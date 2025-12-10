const whatsappService = require('../services/whatsapp.service');
const responseUtils = require('../utils/response.utils');

async function create(req, res){
  try {
    const clientId = req.body.clientId;
    if (!clientId) return responseUtils.UnauthorizedResponse(res, 'ClientId is required');
    await whatsappService.createClient(clientId);
    res.json({ success: true, clientId });
  } catch (err) {
    console.error('[CONTROLLER] create client error', err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}

async function status(req, res) {
  try {
    const clientId = req.body.clientId;
    if (!clientId) return responseUtils.UnauthorizedResponse(res, 'ClientId is required');
    const st = whatsappService.getStatus(clientId);
    res.json(st);
  } catch (err) {
    console.error('[CONTROLLER] status error', err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}

// async function qr(req, res) {
//   try {
//     const clientId = req.params.clientId || req.body.clientId;
//     if (!clientId) return res.status(400).json({ error: 'clientId required' });
//     const dataUrl = await whatsappService.getQrImage(clientId);
//     res.send(`\n<html><body style="font-family:Arial;text-align:center;padding:20px">\n <h2>Scan WhatsApp QR - ${clientId}</h2>\n <img src="${dataUrl}" style="max-width:300px;margin:20px auto;display:block;"/>\n</body></html>`);
//   } catch (err) {
//     console.error('[CONTROLLER] qr error', err);
//     res.status(400).json({ error: err.message });
//   }
// }

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

module.exports = { create, status};