'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comentario extends Model {
    static associate(models) {
      // Un comentario pertenece a un Ticket
      Comentario.belongsTo(models.Ticket, { foreignKey: 'ticketId', as: 'ticket' });
      // Un comentario pertenece a un Usuario
      Comentario.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'autor' });
    }
  }
  Comentario.init({
    texto: DataTypes.TEXT,
    ticketId: DataTypes.INTEGER,
    usuarioId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Comentario',
  });
  return Comentario;
};