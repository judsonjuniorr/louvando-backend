import User from '../models/User';

import Cache from '../../lib/Cache';
import Changelog from '../schemas/Changelog';

import paginatedReturn from './paginatedReturn';

class UserListService {
  async run({ page = 1, perPage = 25 }) {
    perPage = perPage > 75 ? (perPage = 75) : perPage;

    const cachedTotal = await Cache.get(`user:count`);
    const totalUsers = cachedTotal || (await User.findAndCountAll()).count || 0;
    if (!cachedTotal) await Cache.set(`user:count`, totalUsers);

    const cached = await Cache.get(`user:list:${page}:${perPage}`);
    if (cached) return cached;

    const usersFetch = await User.findAll({
      attributes: ['id', 'name', 'email', 'admin', 'active', 'created_at'],
      limit: perPage,
      offset: (page - 1) * perPage,
      order: [['created_at', 'ASC']],
      raw: true,
    });

    const users = paginatedReturn({
      page,
      perPage,
      total: totalUsers,
      data: await Promise.all(
        usersFetch.map(async u => {
          const logs = (await Changelog.find({ user_id: u.id }).count()) || 0;
          return { ...u, logs };
        })
      ),
    });

    await Cache.set(`user:list:${page}:${perPage}`, users);
    return users;
  }
}

export default new UserListService();
