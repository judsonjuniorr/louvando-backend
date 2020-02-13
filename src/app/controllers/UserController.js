import UserListService from '../services/UserListService';
import UserShowService from '../services/UserShowService';
import UserCreateService from '../services/UserCreateService';
import UserUpdateService from '../services/UserUpdateService';
import UserAdminUpdateService from '../services/UserAdminUpdateService';

class UserController {
  async index(req, res) {
    const users = await UserListService.run({
      page: req.query.page,
      perPage: req.query.page,
    });

    return res.json(users);
  }

  async show(req, res) {
    try {
      const users = await UserShowService.run({
        userId: req.params.id,
      });

      return res.json(users);
    } catch (err) {
      return res.status(404).json({ error: err.message });
    }
  }

  async store(req, res) {
    const user = await UserCreateService.run({ data: req.body });
    return res.json(user);
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const admin = req.user;

      const updated =
        !id || !admin
          ? await UserUpdateService.run({
              data: req.body,
              userId: req.userId,
            })
          : await UserAdminUpdateService.run({
              data: req.body,
              userId: id,
              userAdmin: admin,
            });
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new UserController();
