'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregamos prioridad
    await queryInterface.addColumn('Tickets', 'prioridad', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Media'
    });

    // Agregamos tiempo de resolución (en horas o minutos)
    await queryInterface.addColumn('Tickets', 'tiempoResolucion', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tickets', 'prioridad');
    await queryInterface.removeColumn('Tickets', 'tiempoResolucion');
  }
};