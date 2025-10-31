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
        // Consulta todos los registros de la tabla definida en 'postgres.js'
        const registros = await Cliente.findAll(); 
        res.json(registros);
    } catch (error) {
        // Log para depuración
        console.error('Error al obtener clientes:', error); 
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes' });
    }
};

// Renombrada y modificada para devolver 'app' después de la configuración
async function setupApp() {
    try {
        // Intenta autenticar la conexión a la base de datos
        await sequelize.authenticate();
        // Sincroniza los modelos (crea la tabla si no existe o aplica cambios)
        await sequelize.sync({ alter: true }); 
        
        // --- DEFINICIÓN DE RUTAS ---
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
                // Log para depuración
                console.error('Error al crear cliente:', error);
                res.status(500).json({ error: 'Error al insertar el registro en la base de datos' });
            }
        });

        return app; // Devuelve la instancia 'app' con todas las rutas cargadas
    } catch (error) {
        console.error('Failed to configure application:', error.message);
        // Es importante lanzar el error para manejar fallos de configuración críticos
        throw error;
    }
}

// Lógica de inicio principal (Solo se ejecuta si el archivo se corre directamente)
if (require.main === module) {
    setupApp().then(appInstance => { 
        appInstance.listen(port, () => {
             console.log(`Server running on port ${port}`);
        });
    }).catch(err => {
        console.error("Critical startup failure:", err.message);
        process.exit(1);
    });
}

module.exports = setupApp;