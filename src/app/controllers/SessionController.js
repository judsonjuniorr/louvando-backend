import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import authConfig from '../../config/auth';
import Cache from '../../lib/Cache';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email: { [Sequelize.Op.iLike]: email } },
    });
    const { id, name, active, admin } = user;

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!active) {
      return res.status(400).json({ error: 'User is not active' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    await Cache.invalidate(`user:${id}`);

    return res.json({
      user: { id, name, email, active, admin },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
