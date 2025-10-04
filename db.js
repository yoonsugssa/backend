const { Sequelize } = require('sequelize');
require('dotenv').config();
const DB_PORT = parseInt(process.env.DB_PUERTO, 10) || 5432;

const sequelize = new Sequelize(
    process.env.DB_NOMBRE,
    process.env.DB_USUARIO,
    process.env.DB_CLAVE,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        port: DB_PORT,
        logging: false
    }
);
module.exports = sequelize;