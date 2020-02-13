export default err => {
  if (err.inner)
    return err.inner.length > 0
      ? err.inner.map(({ path, type, errors, message }) => ({
          path,
          type,
          errors,
          message,
        }))
      : {
          path: err.inner.path,
          type: err.inner.type,
          errors: err.inner.errors,
          message: err.inner.message,
        };
  return JSON.stringify(err);
};
