'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comentario extends Model {
    static associate(models) {
      // Relación 1:N (inversa) -> Un Comentario pertenece a un Ticket
      Comentario.belongsTo(models.Ticket, {
        foreignKey: 'ticketId',
        as: 'ticket'
      });

      // Relación inversa -> Un Comentario pertenece a un Usuario
      Comentario.belongsTo(models.Usuario, { 
        foreignKey: 'usuarioId',
        as: 'autor'
      });
    }
  }

  Comentario.init({
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Comentario',
    tableName: 'Comentarios'
  });

  return Comentario;
};