const express = require('express');
const sequelize = require('./db'); // Módulo de conexión a la DB
require('dotenv').config(); // Usado para desarrollo local, Vercel usa las Environment Variables del Dashboard.
const cors = require('cors');

const Cliente = require('./postgres'); // Tu modelo de Sequelize

const app = express();
app.use(express.json()); 
app.use(cors()); 

// --- GESTIÓN DE LA CONEXIÓN A LA BASE DE DATOS PARA VERCEL ---

// Variable global para almacenar el estado de la conexión.
// Esto evita reconectar en cada solicitud después del primer "arranque en frío".
let dbConnected = false;

async function connectToDB() {
    if (dbConnected) {
        return; // Ya conectado, no hacer nada.
    }

    try {
        // Conexión y autenticación
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        
        // Sincronización de tablas
        await sequelize.sync({ alter: true }); 
        console.log('🛠 Tablas sincronizadas');
        
        dbConnected = true; // Marcar la conexión como exitosa
    } catch (error) {
        console.error('❌ FATAL: Error al conectar/sincronizar DB:', error.message);
        // Lanzar el error para que el middleware lo capture y devuelva un 500
        throw new Error('Fallo en la conexión a la base de datos. Verifica las Variables de Entorno en Vercel.');
    }
}

// --- MIDDLEWARE PARA ASEGURAR LA CONEXIÓN A DB ---

// Este middleware se ejecuta antes de las rutas y asegura que la DB esté conectada.
app.use(async (req, res, next) => {
    try {
        await connectToDB();
        next(); // Continuar a la ruta solicitada
    } catch (error) {
        // Capturar el error de conexión y responder con un error 500
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            details: 'No se pudo conectar a la base de datos. Verifica las credenciales de Vercel.'
        });
    }
});


// --- RUTAS DE LA API ---

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor Vercel conectado a la DB 🎉');
});

// Ruta POST para crear un cliente
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

// Ruta GET para obtener todos los clientes
app.get('/clientes', async (req, res) => {
    try {
        const registros = await Cliente.findAll(); 
        res.json(registros);
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = app;