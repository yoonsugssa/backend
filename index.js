const express = require('express');
const sequelize = require('./db'); 
require('dotenv').config();
const cors = require('cors');

// Eliminamos 'corsOptions' ya que no se estaba usando correctamente.
// const corsOptions = {
//   origin: 'http://localhost:5174'
// };

const Cliente = require('./postgres'); // Asumo que este es tu modelo Sequelize

const app = express();
app.use(express.json()); 

// ✅ CORRECCIÓN DE CORS: Ahora permite el origen http://localhost:5174, que es el que se ve en el error.
app.use(cors({ 
    origin: 'http://localhost:5174', // ESTO ES LO QUE ESTABA EN 5173
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
})); 

const port = process.env.PORT || 3002; 

// --- HANDLER PARA OBTENER CLIENTES (GET) ---
const getClientsHandler = async (req, res) => {
    try {
        const registros = await Cliente.findAll(); 
        res.json(registros);
    } catch (error) {
        console.error('Error al obtener clientes:', error); 
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes' });
    }
};

// --- HANDLER PARA CREAR CLIENTES (POST) ---
const createClientHandler = async (req, res) => {
    const { nombre } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
    }

    try {
        const nuevoCliente = await Cliente.create({ nombre });
        res.status(201).json(nuevoCliente); 
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ error: 'Error al insertar el registro en la base de datos' });
    }
};


async function setupApp() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida.');
        await sequelize.sync({ alter: true }); 
        
        // --- DEFINICIÓN DE RUTAS API ---
        app.get('/api/clientes', getClientsHandler);
        app.post('/api/clientes', createClientHandler); 

        // Manejo de 404 para rutas no definidas (puramente API)
        app.use((req, res) => {
            res.status(404).json({ error: "Ruta no encontrada. Este servidor solo expone rutas /api/clientes." });
        });

        return app; 
    } catch (error) {
        console.error("Fallo al configurar la aplicación o la DB:", error.message);
        throw error;
    }
}

if (require.main === module) {
    setupApp().then(appInstance => { 
        appInstance.listen(port, () => {
            console.log(`Server running on port http://localhost:${port}`);
            console.log('¡El servidor de Express ahora solo actúa como API!');
        });
    }).catch(err => {
        console.error("Fallo critico al iniciar:", err.message);
        process.exit(1);
    });
}

module.exports = setupApp;