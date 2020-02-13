module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('praises', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      number: Sequelize.INTEGER,
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      collection_id: {
        type: Sequelize.INTEGER,
        references: { model: 'collections', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: false,
      },
      theme_id: {
        type: Sequelize.INTEGER,
        references: { model: 'themes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: false,
      },
      tone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      raw_lyrics: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      lyrics: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      chords: Sequelize.TEXT,
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('praises');
  },
};
