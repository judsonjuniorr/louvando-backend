import User from '../models/User';

import Changelog from '../schemas/Changelog';

import paginatedReturn from './paginatedReturn';

class UserListService {
  async run({ page = 1, perPage = 25 }) {
    perPage = perPage > 75 ? (perPage = 75) : perPage;

    const totalUsers = (await User.findAndCountAll()).count || 0;

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

    return users;
  }
}

export default new UserListService();
