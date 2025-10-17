const express = require('express');
const sequelize = require('./db');
require('dotenv').config();
const cors = require('cors');

const Cliente = require('./postgres'); 

const app = express();
app.use(express.json()); 
app.use(cors()); 

const port = process.env.PORT || 3001; 

async function startServer() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); 
        
        app.get('/', (req, res) => {
            res.send('Servidor de API operativo. Usa la ruta /clientes para obtener los datos.');
        });
        
        app.get('/clientes', async (req, res) => {
            try {
                const registros = await Cliente.findAll(); 
                res.json(registros);
            } catch (error) {
                res.status(500).json({ error: 'Error interno del servidor al obtener clientes' });
            }
        });
        
        app.post('/clientes', async (req, res) => {
            const { nombre } = req.body;
            
            if (!nombre) {
                return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
            }

            try {
                const nuevoCliente = await Cliente.create({ nombre });
                res.status(201).json(nuevoCliente); 
            } catch (error) {
                res.status(500).json({ error: 'Error al insertar el registro en la base de datos' });
            }
        });

        app.listen(port, () => {
            console.log(`Servidor escuchando en http://localhost:${port}`);
        });

    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

startServer();