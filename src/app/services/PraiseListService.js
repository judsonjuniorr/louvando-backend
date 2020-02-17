import Praise from '../models/Praise';
import Collection from '../models/Collection';
import Theme from '../models/Theme';
import Cache from '../../lib/Cache';

import paginatedReturn from './paginatedReturn';

class PraiseListService {
  async run({ page = 1, perPage = 25 }) {
    perPage = perPage > 75 ? (perPage = 75) : perPage;

    const cachedTotal = await Cache.get(`praise:count`);
    const totalPraises =
      cachedTotal || (await Praise.findAndCountAll()).count || 0;
    if (!cachedTotal) await Cache.set(`praise:count`, totalPraises);

    const cached = await Cache.get(`praise:list:${page}:${perPage}`);
    if (cached)
      return paginatedReturn({
        page,
        perPage,
        total: totalPraises,
        data: cached,
      });

    const praises = await Praise.findAll({
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
      order: [
        ['collection_id', 'ASC'],
        ['number', 'ASC'],
        ['created_at', 'ASC'],
      ],
      offset: (page - 1) * perPage,
    });

    await Cache.set(`praise:list:${page}:${perPage}`, praises);

    return paginatedReturn({
      page,
      perPage,
      total: totalPraises,
      data: praises,
    });
  }
}

export default new PraiseListService();
