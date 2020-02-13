import Praise from '../models/Praise';
import Collection from '../models/Collection';
import Theme from '../models/Theme';

import Cache from '../../lib/Cache';

class PraiseShowService {
  async run({ id }) {
    const cached = await Cache.get(`praise:${id}`);
    if (cached) return cached;

    const praise = await Praise.findByPk(id, {
      attributes: [
        'id',
        'number',
        'title',
        'collection_id',
        'theme_id',
        'tone',
        'lyrics',
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
    });

    if (!praise) return null;

    await Cache.set(`praise:${id}`, praise);
    return praise;
  }
}

export default new PraiseShowService();
