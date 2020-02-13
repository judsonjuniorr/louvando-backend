import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import User from '../models/User';
import Changelog from '../schemas/Changelog';

import Cache from '../../lib/Cache';
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

    const cached = await Cache.get(`user:${req.userId}`);

    if (!cached) {
      const user = await User.findByPk(req.userId, {
        attributes: ['id', 'name', 'email', 'admin', 'active', 'created_at'],
        raw: true,
      });

      if (!user) throw new Error('User not found');

      const logs = await Changelog.find({ user_id: req.userId }).select([
        'action',
        'message',
        'section',
        'createdAt',
      ]);

      const { name, email, admin, active } = user;
      req.user = { id: decoded.id, name, email, admin, active };
      await Cache.set(`user:${req.userId}`, { ...req.user, logs });
    } else {
      req.user = cached;
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
