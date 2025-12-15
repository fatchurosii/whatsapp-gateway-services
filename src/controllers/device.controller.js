const responseUtils = require("../utils/response.utils");
const db = require("../models");
const {
  getPaginationParams,
  buildPaginationMeta,
} = require("../utils/paginate.utils");

exports.store = async (req, res) => {
  const { name, whatsappNumber } = req.body;
  const nameTrim = typeof name === "string" ? name.trim() : "";
  const whatsappNumberTrim =
    typeof whatsappNumber === "string" ? whatsappNumber.trim() : "";

  if (!nameTrim || !whatsappNumberTrim) {
    return responseUtils.BadRequestResponse(
      res,
      "Name and whatsappNumber are required",
    );
  }

  try {
    const existingWhatsappNumber = await db.Device.findOne({
      where: { whatsapp_number: whatsappNumberTrim },
    });
    if (existingWhatsappNumber) {
      return responseUtils.BadRequestResponse(
        res,
        "whatsappNumber already exists",
      );
    }

    const existingName = await db.Device.findOne({ where: { name: nameTrim } });
    if (existingName) {
      return responseUtils.BadRequestResponse(res, "Name already exists");
    }
    const device = await db.Device.create({
      name: nameTrim,
      whatsapp_number: whatsappNumberTrim,
    });

    return responseUtils.SuccessResponse(
      res,
      "Device registered successfully",
      device,
    );
  } catch (err) {
    console.error(err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
};

exports.getDevicePaginated = async (req, res) => {
  try {
    const { page, limit, offset, sort, order } = getPaginationParams(
      req.query,
      {
        allowedSortFields: ["id", "name", "whatsapp_number"],
        defaultSort: "id",
      },
    );

    const result = await db.Device.findAndCountAll({
      offset,
      limit,
      order: [[sort, order]],
    });

    const total = result.count || 0;
    const totalPages = Math.ceil(total / limit);

    const meta = {
      ...buildPaginationMeta({
        page,
        limit,
        total,
        totalPages,
        sort,
        order,
      }),
    };

    return responseUtils.PaginatedResponse(
      res,
      "Data Device successfully retrieved",
      result.rows,
      meta,
    );
  } catch (err) {
    console.error("[getDevicePaginated] Error", err);
    return responseUtils.InternalServerErrorResponse(res, err.message);
  }
};
