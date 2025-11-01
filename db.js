const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
    // 🌐 Conexión a la nube (Render, Railway, Neon, etc.)
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // necesario en muchos servicios gestionados
            },
        },
    });
    console.log('🔗 Conectando a base de datos remota usando DATABASE_URL');
} else {
    // 💻 Conexión local
    const {
        DB_NOMBRE,
        DB_USUARIO,
        DB_CLAVE,
        DB_HOST = 'localhost',
        DB_PORT = 5432,
    } = process.env;

    if (!DB_NOMBRE || !DB_USUARIO) {
        console.warn('⚠️ Faltan variables de entorno para conexión local (DB_NOMBRE, DB_USUARIO).');
    }

    sequelize = new Sequelize(DB_NOMBRE, DB_USUARIO, DB_CLAVE, {
        host: DB_HOST,
        port: parseInt(DB_PORT, 10),
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: false, // Local no suele necesitar SSL
                rejectUnauthorized: false,
            },
        },
    });
    console.log('💻 Conectando a base de datos local');
}

module.exports = sequelize;
