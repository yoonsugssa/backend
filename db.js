const { Sequelize } = require('sequelize');
require('dotenv').config();

// Usamos la variable DATABASE_URL, estándar en la nube
const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL) {
    // Caso 1: CONEXIÓN NUBE (Render/DATABASE_URL)
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        // Configuración SSL necesaria para Render
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // Caso 2: CONEXIÓN LOCAL (Usando variables separadas de .env)
    const DB_PORT = parseInt(process.env.DB_PUERTO, 10) || 5432;
    sequelize = new Sequelize(
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
}

module.exports = sequelize;