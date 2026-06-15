'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      // Un Ticket pertenece a un Usuario (solo una vez declarado)
      Ticket.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'autor' });
      // Un Ticket tiene muchos Comentarios
      Ticket.hasMany(models.Comentario, { foreignKey: 'ticketId', as: 'comentarios' });
    }
  }
  Ticket.init({
    titulo: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'Abierto'
    },
    prioridad: {
      type: DataTypes.STRING,
      defaultValue: 'Media'
    },
    tiempoResolucion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    usuarioId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ticket',
  });
  return Ticket;
};