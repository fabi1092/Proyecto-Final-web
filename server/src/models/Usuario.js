'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Relaciones con los modelos que hicimos en el Hito 1
      Usuario.hasMany(models.Ticket, { foreignKey: 'usuarioId', as: 'tickets' });
      Usuario.hasMany(models.Comentario, { foreignKey: 'usuarioId', as: 'comentarios' });
    }
  }
  
  Usuario.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // Valida formato de correo
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      }
    }
  });
  
  return Usuario;
};