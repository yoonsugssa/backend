const express = require('express');
const sequelize = require('./db');
require('dotenv').config();
const cors = require('cors');

const Cliente = require('./postgres'); 

const app = express();
app.use(express.json()); 
app.use(cors()); 

const port = process.env.PORT || 3001; 

const getClientsHandler = async (req, res) => {
    try {
        const registros = await Cliente.findAll(); 
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes' });
    }
};

async function startServer() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); 
        
        app.get('/', getClientsHandler);
        
        app.get('/clientes', getClientsHandler);
        
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
            
        });

    } catch (error) {
        
    }
}

startServer();  