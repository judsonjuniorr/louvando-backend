import Sequelize, { Model } from 'sequelize';

class Praise extends Model {
  static init(sequelize) {
    super.init(
      {
        number: Sequelize.INTEGER,
        title: Sequelize.STRING,
        tone: Sequelize.STRING,
        raw_lyrics: Sequelize.TEXT,
        lyrics: Sequelize.TEXT,
        chords: Sequelize.TEXT,
      },
      { sequelize }
    );

    this.addHook('beforeSave', async praise => {
      praise.title = praise.title.toUpperCase();

      const cp =
        '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">Powered by <a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">Froala Editor</a></p>';

      praise.lyrics = praise.lyrics.split(cp).join('');
      praise.chords = praise.chords.split(cp).join('');

      praise.raw_lyrics = praise.lyrics
        .split('</p><p>')
        .join(' ')
        .split('</p> <p>')
        .join(' ')
        .replace(/(<([^>]+)>)/gi, '');
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Collection, {
      foreignKey: 'collection_id',
      as: 'collection',
    });
    this.belongsTo(models.Theme, { foreignKey: 'theme_id', as: 'theme' });
  }
}

export default Praise;
