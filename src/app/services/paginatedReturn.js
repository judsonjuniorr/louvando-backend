export default ({ page, perPage, total, data }) =>
  total === 0
    ? data
    : {
        total,
        perPage,
        page,
        lastPage: Math.ceil(total / perPage),
        data,
      };
