import User from '../models/User';
import Cache from '../../lib/Cache';

import Changelog from '../schemas/Changelog';

class UserCreateService {
  async run({ data }) {
    const { id, name, email, active, admin } = await User.create({
      ...data,
      active: true,
      admin: false,
    });

    await Changelog.create({
      action: 'create',
      user_id: id,
      section: 'user',
      message: `<p><strong>Novo usuário registrado:</strong><br/></p>
      <p>&nbsp;</p>
      <p><span>ID:</span> <small>${id}</small></p>
      <p><span>Name:<span> <small>${name}</small></p>
      <p><span>Email:<span> <small>${email}</small></p>
      <p><span>Active:<span> <small>${active}</small></p>
      <p><span>Admin:<span> <small>${admin}</small></p>`,
    });

    await Cache.invalidatePrefix('user:list');
    await Cache.invalidate(`user:count`);
    await Cache.set(`user:${id}`, {
      id,
      name,
      email,
      active,
      admin,
      logs: [],
    });
    return { id, name, email, active: false, admin: false };
  }
}

export default new UserCreateService();
