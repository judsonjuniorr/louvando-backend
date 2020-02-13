import User from '../models/User';
import Changelog from '../schemas/Changelog';
import Cache from '../../lib/Cache';

class UserShowService {
  async run({ userId }) {
    const cached = await Cache.get(`user:${userId}`);

    if (cached) return cached;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'admin', 'active', 'created_at'],
      raw: true,
    });

    if (!user) throw new Error('User not found');

    const logs = await Changelog.find({ user_id: userId })
      .select(['action', 'section', 'message', 'createdAt'])
      .sort('-createdAt');
    await Cache.set(`user:${userId}`, { ...user, logs });
    return { ...user, logs };
  }
}

export default new UserShowService();
