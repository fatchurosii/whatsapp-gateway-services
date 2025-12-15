export const getPaginationParams = (query, options = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 100,
    allowedSortFields = ['id'],
    defaultSort = 'id',
    defaultOrder = 'DESC',
  } = options;

  const pageRaw = query.p ?? defaultPage;
  const limitRaw = query.l ?? defaultLimit;
  const sortRaw = query.sort ?? defaultSort;
  const orderRaw = query.order ?? defaultOrder;

  const page = Math.max(parseInt(pageRaw, 10) || defaultPage, 1);
  const limit = Math.min(
    Math.max(parseInt(limitRaw, 10) || defaultLimit, 1),
    maxLimit
  );

  const offset = (page - 1) * limit;

  const sort = allowedSortFields.includes(sortRaw)
    ? sortRaw
    : defaultSort;

  const order = String(orderRaw).toUpperCase() === 'ASC'
    ? 'ASC'
    : 'DESC';

  return {
    page,
    limit,
    offset,
    sort,
    order,
  };
};

export const buildPaginationMeta = ({
  page,
  limit,
  total,
  sort,
  order,
}) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    sort,
    order,
  };
};
