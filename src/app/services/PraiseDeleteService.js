import Praise from '../models/Praise';
import Cache from '../../lib/Cache';
import Changelog from '../schemas/Changelog';

class PraiseDeleteService {
  async run({ id, userId, user }) {
    const praise = await Praise.findByPk(id);

    if (!praise) return null;

    await praise.destroy();
    await Cache.invalidate(`praise:${id}`);
    await Cache.invalidate(`praise:count`);
    await Cache.invalidate('praise:last');

    await Cache.invalidatePrefix('praise:list');
    await Cache.invalidatePrefix('praise:search');

    await Changelog.create({
      action: 'delete',
      user_id: userId,
      section: 'praise',
      message: `
      <p>Louvor: <strong>${praise.title}</strong></p>
      <p>Deletado por: <strong>#${userId} ${user.name}</strong></p>
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

    return true;
  }
}

export default new PraiseDeleteService();
