'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clients', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      secret: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      product_id: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clients');
  }
};