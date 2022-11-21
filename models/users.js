'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users.belongsTo(models.products, {
        foreignKey: 'product_id',
      });
      users.belongsTo(models.roles, {
        foreignKey: 'role_id',
      });
    }
  }
  users.init(
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      phone_verified: DataTypes.STRING,
      role_id: DataTypes.STRING,
      sso_id: DataTypes.STRING,
      sso_token_expiry: DataTypes.DATE,
      product_id: DataTypes.STRING,
      email_verified: DataTypes.STRING,
      active: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'users',
    }
  );
  users.beforeCreate((user) => (user.id = uuid.v4()));

  return users;
};
