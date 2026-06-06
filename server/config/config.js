const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
/*
console.log("\n=== DEBUG DE VARIABLES ===");
console.log("1. Buscando archivo .env en:", path.resolve(__dirname, '../.env'));
console.log("2. Valor de DATABASE_URL:", process.env.DATABASE_URL);
console.log("==========================\n");
*/
module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'mysql',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};