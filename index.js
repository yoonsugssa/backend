// backend/index.js - VERSIÓN FINAL Y COMPROBADA

const express = require('express');
const sequelize = require('./db');
require('dotenv').config();
const cors = require('cors');

// Importar el modelo Cliente (definido en postgres.js)
const Cliente = require('./postgres'); 

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4001;

async function startServer() {
    try {
        // 1. Conexión y sincronización de DB
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        await sequelize.sync({ alter: true });
        console.log('🛠 Tablas sincronizadas');
        
        // --- RUTAS DE LA API (DEBEN ESTAR AQUÍ) ---
        app.get('/clientes', async (req, res) => {
            try {
                // Consulta la tabla 'cliente'
                const registros = await Cliente.findAll(); 
                res.json(registros);
            } catch (error) {
                console.error('Error al obtener registros:', error);
                res.status(500).json({ error: 'Error interno del servidor', details: error.message });
            }
        });

        // Ruta de prueba (/)
        app.get('/', (req, res) => {
            res.send('Servidor conectado a la DB 🏴‍☠');
        });
        
        // 2. Iniciar el servidor (DEBE SER EL ÚLTIMO PASO)
        app.listen(port, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
        });

    } catch (error) {
        console.error('❌ FATAL: Error al iniciar el servidor o conectar la DB:', error.message);
    }
}

startServer();