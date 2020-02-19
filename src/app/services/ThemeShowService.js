import Sequelize from 'sequelize';

import Theme from '../models/Theme';
import Praise from '../models/Praise';
import Collection from '../models/Collection';

import paginatedReturn from './paginatedReturn';

class ThemeShowService {
  async run({ id, page = 1, perPage = 25 }) {
    const theme = await Theme.findByPk(id, {
      attributes: [
        'id',
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('praises.id')), 'totalPraise'],
      ],
      include: [{ model: Praise, as: 'praises', attributes: [] }],
      group: ['Theme.id'],
      raw: true,
    });

    if (!theme) return null;

    const praises = await Praise.findAll({
      where: { collection_id: id },
      attributes: [
        'id',
        'number',
        'title',
        'collection_id',
        'theme_id',
        'tone',
        'chords',
      ],
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'name'],
        },
        {
          model: Theme,
          as: 'theme',
          attributes: ['id', 'name'],
        },
      ],
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    const totalPraises =
      (await Praise.findAndCountAll({ where: { theme_id: id } })).count || 0;

    return {
      ...theme,
      praises: paginatedReturn({
        page,
        perPage,
        total: totalPraises,
        data: praises,
      }),
    };
  }
}

export default new ThemeShowService();
