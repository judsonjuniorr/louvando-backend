import Sequelize, { Model } from 'sequelize';

class Collection extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Praise, { key: 'collection_id', as: 'praises' });
  }
}

export default Collection;
