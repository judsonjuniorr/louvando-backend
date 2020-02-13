import Sequelize from 'sequelize';

import Theme from '../models/Theme';
import Praise from '../models/Praise';
import Changelog from '../schemas/Changelog';

import Cache from '../../lib/Cache';

import ThemeShowService from '../services/ThemeShowService';

class ThemeController {
  async index(req, res) {
    const themes = await Theme.findAll({
      attributes: [
        'id',
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('praises.id')), 'totalPraise'],
      ],
      include: [{ model: Praise, as: 'praises', attributes: [] }],
      group: ['Theme.id'],
    });

    return res.json(themes);
  }

  async show(req, res) {
    const theme = await ThemeShowService.run({
      id: req.params.id,
      page: req.query.page,
      perPage: req.query.perPage,
    });

    return res.json(theme);
  }

  async store(req, res) {
    const { id, name } = await Theme.create(req.body);

    await Changelog.create({
      action: 'create',
      user_id: req.userId,
      section: 'theme',
      message: `<p><span>Tema <strong>#${id} ${name}</strong> criado por #${req.userId} ${req.user.name}</span></p>`,
    });

    await Cache.invalidate(`user:${req.userId}`);
    await Cache.invalidatePrefix('user:list');
    const theme = await ThemeShowService.run({ id });

    return res.json(theme);
  }

  async update(req, res) {
    const { id } = req.params;
    const theme = await Theme.findByPk(id);

    if (!theme) return res.status(400).json({ error: `Theme not found` });

    const { name } = await theme.update(req.body);
    await Changelog.create({
      action: 'update',
      user_id: req.userId,
      section: 'theme',
      message: `<p><strong>#${req.userId} ${req.user.name}</strong></p>
      <p>Alterou o tema <strong>${theme.name}</strong>:<br/></p>
      <p><span>Name:<span> <small>${name}</small></p>`,
    });

    await Cache.invalidate(`user:${req.userId}`);
    await Cache.invalidatePrefix('user:list');
    await Cache.invalidatePrefix(`theme:${id}`);
    const updatedTheme = await ThemeShowService.run({ id });
    return res.json(updatedTheme);
  }

  async delete(req, res) {
    const { id } = req.params;

    const theme = await Theme.findByPk(id);
    const cached = await Cache.get(`theme:${id}:1:25`);

    try {
      if (cached && Number(cached.totalPraises) > 0) {
        throw new Error(
          `It's not possible to exclude a theme in which there is praise`
        );
      } else {
        if (!theme) throw new Error('Theme not found');

        const praises = Number(
          (
            await Praise.findAndCountAll({
              where: { theme_id: theme.id },
            })
          ).count
        );

        if (praises > 0)
          throw new Error(
            `It's not possible to exclude a theme in which there is praise`
          );
      }
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    await theme.destroy();
    await Cache.invalidatePrefix(`theme:${id}`);

    await Changelog.create({
      action: 'delete',
      user_id: req.userId,
      section: 'theme',
      message: `<p><strong>#${req.userId} ${req.user.name}</strong></p>
      <p>Deletou o tema <strong>${theme.name}</strong>:<br/></p>`,
    });

    await Cache.invalidate(`user:${req.userId}`);
    await Cache.invalidatePrefix('user:list');
    return res.json();
  }
}

export default new ThemeController();
