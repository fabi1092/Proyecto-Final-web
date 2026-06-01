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
      
      // NOTA: Cuando hagamos el GEN-04 (Usuarios), agregaremos:
      // Ticket.belongsTo(models.Usuario, { foreignKey: 'usuarioId' })
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
    tableName: 'Tickets' // Asegura que coincida con el nombre en la migración
  });
  
  return Ticket;
};