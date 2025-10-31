const express = require('express');
const sequelize = require('./db');
require('dotenv').config();
const cors = require('cors');
// 🔑 Importar el módulo 'path'
const path = require('path'); 

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


async function setupApp() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); 
        
        // --- DEFINICIÓN DE RUTAS API ---
        
        // 🔑 CAMBIO 1: La ruta API GET se mueve a un prefijo (ej. /api/clientes)
        // Esto evita el conflicto con el archivo index.html
        app.get('/api/clientes', getClientsHandler);
        
        app.post('/api/clientes', async (req, res) => { // La ruta POST también debe ser /api/clientes
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

        // ----------------------------------------------------------------------------------
        // 🔑 PASO CLAVE 2: Configurar el servicio de archivos estáticos (Frontend)
        // Express buscará el index.html en la carpeta 'dist' cuando se acceda a la raíz (/)
        // Esto debe ir DESPUÉS de las rutas API para que las rutas API tengan prioridad.
        // Asumiendo que tu frontend compilado está en la carpeta 'dist'.
        // ----------------------------------------------------------------------------------
        const frontendPath = path.join(__dirname, 'dist'); 
        app.use(express.static(frontendPath));

        // 🔑 PASO CLAVE 3 (Para Routers de Frontend como Vue/React):
        // Para gestionar rutas que no coinciden (ej. /login o /acerca-de) sin que el servidor
        // devuelva un 404, se devuelve siempre el index.html
        app.get('*', (req, res) => {
            res.sendFile(path.join(frontendPath, 'index.html'));
        });

        return app; 
    } catch (error) {
        console.error('Failed to configure application:', error.message);
        throw error;
    }
}

// Lógica de inicio principal (sin cambios)
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