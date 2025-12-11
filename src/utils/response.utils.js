function buildResponse({
  status,
  message = "",
  data = null,
  errors = undefined,
}) {
  const base = {
    status,
    message: message || (status === "success" ? "Success" : "Error"),
    data: data !== undefined ? data : null,
  };
  if (errors !== undefined && errors !== null) {
    base.errors = errors;
  }

  return base;
}

function PaginatedResponse(res, message, data) {
  const code = 200;

  const payload = buildResponse({
    status: "success",
    message: message,
    data,
    errors: null,
  });

  return res.status(code).json({ ...payload, data });
}

function ErrorResponse(
  res,
  statusCode = 500,
  message = "Error",
  errors = null,
) {
  const code = statusCode;

  const payload = buildResponse({
    status: "error",
    message,
    data: null,
    errors: errors ?? { message },
  });
  return res.status(code).json(payload);
}

function SuccessResponse(res, message = "Success", data = null) {
  const code = 200;

  const payload = buildResponse({
    status: "success",
    message,
    data,
  });

  return res.status(code).json(payload);
}

function BadRequestResponse(res, message = "Bad Request", errors = null) {
  return ErrorResponse(res, 400, message, errors);
}
function UnauthorizedResponse(res, message = "Unauthorized", errors = null) {
  return ErrorResponse(res, 401, message, errors);
}
function ForbiddenResponse(res, message = "Forbidden", errors = null) {
  return ErrorResponse(res, 403, message, errors);
}
function NotFoundResponse(res, message = "Not Found", errors = null) {
  return ErrorResponse(res, 404, message, errors);
}
function UnprocessableEntityResponse(
  res,
  message = "Unprocessable Entity",
  errors = null,
) {
  return ErrorResponse(res, 422, message, errors);
}
function InternalServerErrorResponse(
  res,
  message = "Internal Server Error",
  errors = null,
) {
  return ErrorResponse(res, 500, message, errors);
}

module.exports = {
  ErrorResponse,
  SuccessResponse,
  PaginatedResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  UnprocessableEntityResponse,
  InternalServerErrorResponse,
};
