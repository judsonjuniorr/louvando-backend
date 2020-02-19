import User from '../models/User';

import Changelog from '../schemas/Changelog';

class UserAdminUpdateService {
  async run({ data, userId, userAdmin }) {
    const { email } = data;
    const user = await User.findByPk(userId);

    if (!user) throw new Error('User not found');

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) throw new Error('User already exists.');
    }

    const { id, name, email: newEmail, active, admin } = await user.update(
      data
    );

    await Changelog.create({
      action: 'update',
      user_id: userId,
      section: 'user',
      message: `<p>Usuário alterado por <strong>#${userAdmin.id} ${userAdmin.name}</strong></p>
      <p>&nbsp;</p>
      <p><span>Name:<span> <small>${name}</small></p>
      <p><span>Email:<span> <small>${newEmail}</small></p>
      <p><span>Active:<span> <small>${active}</small></p>
      <p><span>Admin:<span> <small>${admin}</small></p>`,
    });

    return { id, name, email: newEmail, active, admin };
  }
}

export default new UserAdminUpdateService();
