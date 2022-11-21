'use strict';
const {
  Model
} = require('sequelize');
const uuid = require("uuid");
module.exports = (sequelize, DataTypes) => {
  class roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      roles.belongsTo(models.products, {
        foreignKey: "product_id"
      })
      roles.hasMany(models.users, {
        foreignKey: "role_id"
      })
    }
  }
  roles.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    product_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'roles',
  });
  roles.beforeCreate(role => role.id = uuid.v4());

  return roles;
};