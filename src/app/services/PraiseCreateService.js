import Praise from '../models/Praise';
import Changelog from '../schemas/Changelog';

import Cache from '../../lib/Cache';
import PraiseShowService from './PraiseShowService';

class PraiseCreateService {
  async run({ userId, user, data }) {
    const praise = await Praise.create(data);

    await Changelog.create({
      action: 'create',
      user_id: userId,
      section: 'praise',
      message: `
      <p>Louvor: <strong>${praise.title}</strong></p>
      <p>Criado por: <strong>#${userId} ${user.name}</strong></p>
      <p>&nbsp;</p>
      ${praise.number ? `<p>Número: <strong>${praise.number}</strong></p>` : ''}
      <p>Título: <strong>${praise.title}</strong></p>
      <p>Tonalidade: <strong>${praise.tone}</strong></p>
      <p>Letra:</p>
      <p style="padding-left: 40px;"><em><strong>${
        praise.lyrics
      }</strong></em></p>
      <p>Cifra:</p>
      ${
        praise.chords
          ? `<p style="padding-left: 40px;"><em><strong>${praise.chords}</strong></em></p>`
          : ''
      }
    `,
    });

    const finalPraise = await PraiseShowService.run({ id: praise.id });

    await Cache.set(`praise:count`, (await Praise.findAndCountAll()).count);
    await Cache.invalidate('praise:last');
    await Cache.invalidatePrefix(`collection:${praise.collection_id}`);
    await Cache.invalidatePrefix(`theme:${praise.theme_id}`);
    await Cache.invalidatePrefix('praise:list');
    await Cache.invalidatePrefix('praise:search');
    await Cache.invalidatePrefix('user:list');

    return finalPraise;
  }
}

export default new PraiseCreateService();
