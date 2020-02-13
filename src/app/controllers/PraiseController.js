import PraiseListService from '../services/PraiseListService';
import PraiseShowService from '../services/PraiseShowService';
import PraiseCreateService from '../services/PraiseCreateService';
import PraiseUpdateService from '../services/PraiseUpdateService';
import PraiseDeleteService from '../services/PraiseDeleteService';

class PraiseController {
  async index(req, res) {
    const praises = await PraiseListService.run({
      page: req.query.page,
      perPage: req.query.perPage,
    });
    return res.json(praises);
  }

  async show(req, res) {
    const praise = await PraiseShowService.run({ id: req.params.id });

    if (!praise) return res.status(400).json({ error: `Praise not found` });
    return res.json(praise);
  }

  async store(req, res) {
    const praise = await PraiseCreateService.run({
      userId: req.userId,
      user: req.user,
      data: req.body,
    });
    return res.json(praise);
  }

  async update(req, res) {
    const updatedPraise = await PraiseUpdateService.run({
      userId: req.userId,
      user: req.user,
      id: req.params.id,
      data: req.body,
    });

    if (!updatedPraise)
      return res.status(400).json({ error: `Praise not found` });

    return res.json(updatedPraise);
  }

  async delete(req, res) {
    const deletePraise = await PraiseDeleteService.run({
      id: req.params.id,
      userId: req.userId,
      user: req.user,
    });
    if (!deletePraise)
      return res.status(400).json({ error: 'Praise not found' });
    return res.json();
  }
}

export default new PraiseController();
