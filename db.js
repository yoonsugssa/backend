const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL) {
    // Caso 1: CONEXIÓN NUBE (Usando DATABASE_URL, ya incluye SSL)
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false 
            }
        }
    });
} else {
    // Caso 2: CONEXIÓN LOCAL (Usando variables separadas)
    // ** ESTA CONFIGURACIÓN AHORA INCLUYE SSL PARA CONECTAR A RENDER **
    
    const DB_PORT = parseInt(process.env.DB_PORT, 10) || 5432;
    
    sequelize = new Sequelize(
        process.env.DB_NOMBRE,
        process.env.DB_USUARIO,
        process.env.DB_CLAVE,
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'postgres',
            port: DB_PORT,
            logging: false,
            // 🔑 Se añade la configuración SSL:
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false 
                }
            }
        }
    );
}

module.exports = sequelize;