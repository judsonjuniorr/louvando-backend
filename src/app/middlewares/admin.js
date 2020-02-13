export default async (req, res, next) =>
  req.user.admin
    ? next()
    : res.status(401).json({ error: 'Você não tem permissão' });
