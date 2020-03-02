import _ from 'lodash';
import Sequelize from 'sequelize';
import Theme from '../models/Theme';
import Praise from '../models/Praise';
import Collection from '../models/Collection';

import paginatedReturn from '../services/paginatedReturn';
import Cache from '../../lib/Cache';

class SearchPraiseController {
  async index(req, res) {
    const { query, page = 1 } = req.query;
    let { perPage = 25 } = req.query;
    perPage = Number(perPage > 75 ? (perPage = 75) : perPage);
    const offset = (page - 1) * perPage;

    const cached = await Cache.get(`praise:search:${query}:${page}:${perPage}`);

    if (cached) return res.json(cached);

    const attr = {
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
      raw: true,
    };

    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(+query)) {
      const numberPraise = await Praise.findAll({
        ...attr,
        where: { number: Number(query) },
      });

      const praisesReturn = paginatedReturn({
        page,
        perPage,
        total: numberPraise.length,
        data: numberPraise,
      });

      await Cache.set(
        `praise:search:${query}:${page}:${perPage}`,
        praisesReturn
      );
      return res.json(praisesReturn);
    }

    const titlePraise = await Praise.findAll({
      ...attr,
      where: {
        title: { [Sequelize.Op.iLike]: `%${query}%` },
      },
    });
    const lyricsPraise = await Praise.findAll({
      ...attr,
      where: {
        raw_lyrics: { [Sequelize.Op.iLike]: `%${query}%` },
      },
    });

    const praiseList = _.uniqBy([...titlePraise, ...lyricsPraise], o => o.id);
    const praises = praiseList.slice(offset, page * perPage);

    const praisesReturn = paginatedReturn({
      page,
      perPage,
      total: praiseList.length,
      data: praises,
    });

    await Cache.set(`praise:search:${query}:${page}:${perPage}`, praisesReturn);
    return res.json(praisesReturn);
  }
}

export default new SearchPraiseController();
