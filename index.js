const express = require('express');
const sequelize = require('./db');
require('dotenv').config();
const cors = require('cors');

const Cliente = require('./postgres'); // Asegúrate que la ruta a tu modelo sea correcta

const app = express();
app.use(express.json()); 
app.use(cors()); 

const port = process.env.PORT || 3001; 

async function startServer() {
    try {
        // 1. CONEXIÓN Y AUTENTICACIÓN
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        
        // 2. SINCRONIZACIÓN DE TABLAS (CREACIÓN)
        await sequelize.sync({ alter: true }); 
        console.log('🛠 Tablas sincronizadas');
        
        // --- RUTAS DE LA API ---

        app.post('/clientes', async (req, res) => {
            const { nombre } = req.body;
            
            if (!nombre) {
                return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
            }

            try {
                const nuevoCliente = await Cliente.create({ nombre });
                res.status(201).json(nuevoCliente); 
            } catch (error) {
                console.error('Error al crear el cliente:', error);
                res.status(500).json({ error: 'Error al insertar el registro en la base de datos' });
            }
        });

        app.get('/clientes', async (req, res) => {
            try {
                const registros = await Cliente.findAll(); 
                res.json(registros);
            } catch (error) {
                console.error('Error al obtener registros:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        });

        app.get('/', (req, res) => {
            res.send('Servidor conectado a la DB 🎉');
        });
        
        // 3. INICIO DEL SERVIDOR
        app.listen(port, () => {
            console.log(`✔ Servidor corriendo en http://localhost:${port}`);
        });

    } catch (error) {
        console.error('❌ FATAL: Error al iniciar el servidor o conectar la DB:', error.message);
    }
}

startServer();