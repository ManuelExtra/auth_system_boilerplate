'use strict';
const {
  Model
} = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      products.hasOne(models.clients, {
        foreignKey: "product_id"
      })
      products.hasMany(models.roles, {
        foreignKey: "product_id"
      })
      products.hasMany(models.scopes, {
        foreignKey: "product_id"
      })
      products.hasMany(models.users, {
        foreignKey: "product_id"
      })
    }
  }
  products.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    product_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'products',
  });
  products.beforeCreate(product => product.id = uuid.v4());
  return products;
};