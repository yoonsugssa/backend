const express = require('express');
const sequelize = require('./db');
require('dotenv').config();
const cors = require('cors');

const Cliente = require('./postgres'); 

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4001;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        await sequelize.sync({ alter: true });
        console.log('🛠 Tablas sincronizadas');
        
        app.get('/clientes', async (req, res) => {
            try {
                const registros = await Cliente.findAll(); 
                res.json(registros);
            } catch (error) {
                console.error('Error al obtener registros:', error);
                res.status(500).json({ error: 'Error interno del servidor', details: error.message });
            }
        });

        app.get('/', (req, res) => {
            res.send('Servidor conectado a la DB 🎉');
        });
        
        app.listen(port, () => {
            console.log(`✔ Servidor corriendo en http://localhost:${port}`);
            console.log(`✔ La tabla corriendo en http://localhost:${port}/clientes`);
        });

    } catch (error) {
        console.error('❌ FATAL: Error al iniciar el servidor o conectar la DB:', error.message);
    }
}

startServer();