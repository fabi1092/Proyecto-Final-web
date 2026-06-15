'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ResetToken extends Model {
    static associate(models) {
      // No necesitamos asociaciones complejas aquí, solo guardaremos a quién pertenece el token
    }
  }
  ResetToken.init({
    token: DataTypes.STRING,
    email: DataTypes.STRING,
    expiracion: DataTypes.DATE,
    usado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ResetToken',
  });
  return ResetToken;
};