import Sequelize from 'sequelize';

import Collection from '../models/Collection';
import Praise from '../models/Praise';

import Changelog from '../schemas/Changelog';

import Cache from '../../lib/Cache';

import CollectionShowService from '../services/CollectionShowService';

class CollectionController {
  async index(req, res) {
    const collections = await Collection.findAll({
      attributes: [
        'id',
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('praises.id')), 'totalPraise'],
      ],
      include: [{ model: Praise, as: 'praises', attributes: [] }],
      group: ['Collection.id'],
    });

    return res.json(collections);
  }

  async show(req, res) {
    const collection = await CollectionShowService.run({
      id: req.params.id,
      page: req.query.page,
      perPage: req.query.perPage,
    });

    if (!collection)
      return res.status(400).json({ error: 'Collection not found' });

    return res.json(collection);
  }

  async store(req, res) {
    const { id, name } = await Collection.create(req.body);

    await Changelog.create({
      action: 'create',
      user_id: req.userId,
      section: 'collection',
      message: `<p><span>Coleção <strong>#${id} ${name}</strong> criada por #${req.userId} ${req.user.name}</span></p>`,
    });

    await Cache.invalidatePrefix('user:list');
    const collection = await CollectionShowService.run({ id });
    return res.json(collection);
  }

  async update(req, res) {
    const { id } = req.params;
    const collection = await Collection.findByPk(id);

    if (!(await Collection.findByPk(id)))
      return res.status(400).json({ error: `Collection not found` });

    const { name } = await collection.update(req.body);

    await Changelog.create({
      action: 'update',
      user_id: req.userId,
      section: 'collection',
      message: `<p><strong>#${req.userId} ${req.user.name}</strong></p>
      <p>Alterou a coleção <strong>${collection.name}</strong>:<br/></p>
      <p><span>Name:<span> <small>${name}</small></p>`,
    });

    await Cache.invalidatePrefix('user:list');
    await Cache.invalidatePrefix(`collection:${id}`);
    const updatedCollection = await CollectionShowService.run({ id });

    return res.json(updatedCollection);
  }

  async delete(req, res) {
    const { id } = req.params;

    const collection = await Collection.findByPk(id);
    const cached = await Cache.get(`collection:${id}:1:25`);

    try {
      if (cached && Number(cached.totalPraises) > 0) {
        throw new Error(
          `It's not possible to exclude a collection in which there is praise`
        );
      } else {
        if (!collection) throw new Error('Collection not found');

        const praises = Number(
          (
            await Praise.findAndCountAll({
              where: { collection_id: collection.id },
            })
          ).count
        );

        if (praises > 0)
          throw new Error(
            `It's not possible to exclude a collection in which there is praise`
          );
      }
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    await collection.destroy();
    await Cache.invalidatePrefix(`collection:${id}`);

    await Changelog.create({
      action: 'delete',
      user_id: req.userId,
      section: 'collection',
      message: `<p><strong>#${req.userId} ${req.user.name}</strong></p>
      <p>Deletou a coleção <strong>${collection.name}</strong>:<br/></p>`,
    });

    await Cache.invalidatePrefix('user:list');
    return res.json();
  }
}

export default new CollectionController();
