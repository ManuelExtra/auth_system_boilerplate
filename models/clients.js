'use strict';
const {
  Model
} = require('sequelize');
const uuid = require("uuid");
module.exports = (sequelize, DataTypes) => {
  class clients extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      clients.belongsTo(models.products, {
        foreignKey: "product_id"
      })
    }
  }
  clients.init({
    name: DataTypes.STRING,
    secret: DataTypes.STRING,
    url: DataTypes.STRING,
    product_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'clients',
  });
  clients.beforeCreate(client => client.id = uuid.v4());
  return clients;
};