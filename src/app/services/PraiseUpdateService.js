import Praise from '../models/Praise';
import Changelog from '../schemas/Changelog';

import Cache from '../../lib/Cache';
import PraiseShowService from './PraiseShowService';

class PraiseUpdateService {
  async run({ userId, user, id, data }) {
    const praise = await Praise.findByPk(id);

    if (!praise) return null;

    const { number, title, tone, lyrics, chords } = await praise.update(data);

    await Changelog.create({
      action: 'update',
      user_id: userId,
      section: 'praise',
      message: `<p>Louvor: <strong>${praise.title}</strong></p>
      <p>Criado por: <strong>#${userId} ${user.name}</strong></p>
      <p>&nbsp;</p>
      ${number ? `<p>Número: <strong>${number}</strong></p>` : ''}
      <p>Título: <strong>${title}</strong></p>
      <p>Tonalidade: <strong>${tone}</strong></p>
      <p>Letra:</p>
      <p style="padding-left: 40px;"><em>${lyrics}</em></p>
      <p>Cifra:</p>
      ${chords ? `<p style="padding-left: 40px;"><em>${chords}</em></p>` : ''}`,
    });

    await Cache.invalidate(`praise:${id}`);
    const updatedPraise = await PraiseShowService.run({ id });

    await Cache.invalidate('praise:last');
    await Cache.invalidatePrefix(`collection:${praise.collection_id}`);
    await Cache.invalidatePrefix(`collection:${updatedPraise.collection_id}`);
    await Cache.invalidatePrefix(`theme:${praise.theme_id}`);
    await Cache.invalidatePrefix(`theme:${updatedPraise.theme_id}`);
    await Cache.invalidatePrefix('praise:list');
    await Cache.invalidatePrefix('praise:search');
    await Cache.invalidate(`user:${userId}`);
    await Cache.invalidatePrefix('user:list');

    return updatedPraise;
  }
}

export default new PraiseUpdateService();
