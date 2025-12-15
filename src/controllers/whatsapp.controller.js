const db = require("../models");
const whatsappService = require("../services/whatsapp.service");
const responseUtils = require("../utils/response.utils");

async function status(req, res) {
  try {
    const clientId = req.body.clientId;
    if (!clientId)
      return responseUtils.BadRequestResponse(res, "ClientId is required");

    const device = await db.Device.findOne({
      where: {
        deviceKey: clientId,
      },
    });

    if (!device) return responseUtils.NotFoundResponse(res, "Device not found");

    const client = whatsappService.getClient(clientId);
    if (!client) {
      return responseUtils.NotFoundResponse(res, "Client not found");
    }
    const status = whatsappService.getStatus(clientId);
    if (!status.exists) {
      return responseUtils.NotFoundResponse(res, "Client not found");
    }

    return responseUtils.SuccessResponse(
      res,
      "Status retrieved successfully",
      status,
    );
  } catch (err) {
    console.error("[CONTROLLER] status error", err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}

async function qr(req, res) {
  try {
    const clientId = req.body.clientId;
    if (!clientId)
      return responseUtils.BadRequestResponse(res, "ClientId is required");

    const device = await db.Device.findOne({
      where: {
        deviceKey: clientId,
      },
    });

    if (!device) return responseUtils.NotFoundResponse(res, "Device not found");

    const deviceKey = device?.deviceKey ? device.deviceKey : null;

    if (!deviceKey)
      return responseUtils.BadRequestResponse(res, "Device key is required");

    const client = await whatsappService.getClient(deviceKey);

    if (!client) {
      await whatsappService.createClient(deviceKey);
    }

    const qrUrl = await whatsappService.getQrImage(deviceKey);

    const resData = {
      qrUrl,
      device,
    };

    //uncomment if development

    // return res.send(`<html>
    //         <head><title>WhatsApp QR</title></head>
    //         <body style="font-family:Arial;text-align:center;padding:20px">
    //           <h2>Scan WhatsApp QR Code</h2>
    //           <img src="${qrUrl}" style="max-width:300px;margin:20px auto;display:block;" />
    //           <p>Scan this code with your phone</p>
    //         </body>
    //       </html>
    //     `);
    // end uncomment
    return responseUtils.SuccessResponse(
      res,
      "Qr Berhasil ditampilkan",
      resData,
    );
  } catch (err) {
    console.error("[CONTROLLER] qr error", err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}

async function sendMessage(req, res) {
  try {
    const { clientId, number, message } = req.body;

    if (!clientId || !message || !number) {
      return responseUtils.BadRequestResponse(
        res,
        "clientId, number, message are required",
      );
    }

    const device = await db.Device.findOne({
      deviceKey: clientId,
    });

    if (!device) {
      return responseUtils.NotFoundResponse(res, "Device not found");
    }

    const sent = await whatsappService.sendMessage(clientId, number, message);

    if (sent.id.id === null || sent.id.id === undefined) {
      return responseUtils.BadRequestResponse(res, "Send message failed");
    }

    const sendMessage = {
      success: true,
      id: sent.id.id,
      timestamp: sent.timestamp,
    };

    return responseUtils.SuccessResponse(
      res,
      "Send message successfully",
      sendMessage,
    );
  } catch (err) {
    console.error("[CONTROLLER] sendMessage error", err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}

async function logout(req, res) {
  try {
    const clientId = req.body.clientId;
    if (!clientId) {
      return responseUtils.BadRequestResponse(res, "clientId is required");
    }

    const device = await db.Device.findOne({
      deviceKey: clientId,
    });

    if (!device) {
      return responseUtils.NotFoundResponse(res, "Device not found");
    }

    const deviceKey = device.deviceKey ? device?.deviceKey : null;

    if (!deviceKey) {
      return responseUtils.NotFoundResponse(res, "Device key not found");
    }

    const client = whatsappService.getClient(deviceKey);

    if (!client) {
      return responseUtils.NotFoundResponse(
        res,
        `Client with device id : ${deviceKey} not found`,
      );
    }

    await whatsappService.resetClient(deviceKey, "manual_logout");

    return responseUtils.SuccessResponse(res, "Logout successfully");
  } catch (err) {
    console.error("[CONTROLLER] logout error", err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
}

module.exports = { status, qr, sendMessage, logout };
