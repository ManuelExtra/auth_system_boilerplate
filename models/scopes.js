'use strict';
const {
  Model
} = require('sequelize');
const uuid = require("uuid");
module.exports = (sequelize, DataTypes) => {
  class scopes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      scopes.belongsTo(models.products, {
        foreignKey: "product_id"
      })
    }
  }
  scopes.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    product_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'scopes',
  });
  scopes.beforeCreate(scope => scope.id = uuid.v4());
  return scopes;
};