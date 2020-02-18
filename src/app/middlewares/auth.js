import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import User from '../models/User';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decoded.id;

    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'name', 'email', 'admin', 'active', 'created_at'],
      raw: true,
    });

    if (!user) throw new Error('User not found');

    const { name, email, admin, active } = user;
    req.user = { id: decoded.id, name, email, admin, active };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
