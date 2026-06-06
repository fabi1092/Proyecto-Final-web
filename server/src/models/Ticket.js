'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      // Relación 1:N -> Un Ticket tiene muchos Comentarios
      Ticket.hasMany(models.Comentario, {
        foreignKey: 'ticketId',
        as: 'comentarios'
      });
      
      // Relación inversa -> Un Ticket pertenece a un Usuario (El que borraste xd)
      Ticket.belongsTo(models.Usuario, { 
        foreignKey: 'usuarioId',
        as: 'autor'
      });
    }
  }
  
  Ticket.init({
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Abierto', 'En Progreso', 'Cerrado'),
      defaultValue: 'Abierto'
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Ticket',
    tableName: 'Tickets'
  });
  
  return Ticket;
};