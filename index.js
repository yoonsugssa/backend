const express = require('express');
const sequelize = require('./db');
require('dotenv').config();
const cors = require('cors');
const path = require('path'); 

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
        console.error('Error al obtener clientes:', error); 
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes' });
    }
};


async function setupApp() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); 
        
        // --- DEFINICIÓN DE RUTAS API ---
        app.get('/api/clientes', getClientsHandler);
        
        app.post('/api/clientes', async (req, res) => {
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
        });

        // --- CONFIGURACIÓN PARA SERVIR EL FRONTEND (SPA) ---
        const frontendPath = path.join(__dirname, '..', 'frontend', 'dist'); // <-- ¡LÍNEA CLAVE CORREGIDA!
        app.use(express.static(frontendPath));

        // 🔑 CORRECCIÓN FINAL: Usar app.use como catch-all. Esto evita el error de sintaxis 'Missing parameter name'.
        app.use((req, res) => { 
        (path.join(frontendPath, 'index.html'));
        });

        return app; 
    } catch (error) {
        console.error("Failed to configure application:", error.message);
        throw error;
    }
}

// Lógica de inicio principal
if (require.main === module) {
    setupApp().then(appInstance => { 
        appInstance.listen(port, () => {
             console.log(`Server running on port http://localhost:${port}`);
        });
    }).catch(err => {
        console.error("Critical startup failure:", err.message);
        process.exit(1);
    });
}

module.exports = setupApp;