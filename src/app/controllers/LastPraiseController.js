import Praise from '../models/Praise';
import Theme from '../models/Theme';
import Collection from '../models/Collection';

import Cache from '../../lib/Cache';

class LastPraiseController {
  async index(req, res) {
    const cached = await Cache.get('praise:last');
    if (cached) return res.json(cached);

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
        { model: Theme, as: 'theme', attributes: ['id', 'name'] },
        { model: Collection, as: 'collection', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    await Cache.set('praise:last', praises);

    return res.json(praises);
  }
}

export default new LastPraiseController();
