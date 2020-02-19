import User from '../models/User';

import Changelog from '../schemas/Changelog';

class UserUpdateService {
  async run({ data, userId }) {
    const { email, oldPassword } = data;
    const user = await User.findByPk(userId);

    delete data.admin;
    delete data.active;

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) throw new Error('User already exists.');
    }

    if (oldPassword && !(await user.checkPassword(oldPassword)))
      throw new Error('Password does not match');

    const { id, name, email: newEmail, active, admin } = await user.update(
      data
    );

    await Changelog.create({
      action: 'update',
      user_id: userId,
      section: 'user',
      message: `<p><strong>#${userId} ${user.name} <small>(${newEmail})</small></strong></p>
      <p>Alterou seu usuário para:</p>
      <p>&nbsp;</p>
      <p><span>Name:<span> <small>${name}</small></p>
      <p><span>Email:<span> <small>${newEmail}</small></p>
      <p><span>Active:<span> <small>${active}</small></p>
      <p><span>Admin:<span> <small>${admin}</small></p>`,
    });

    return { id, name, email: newEmail, active, admin };
  }
}

export default new UserUpdateService();
