const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./db');  
const Cliente = require('./postgres'); 

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());

const PORT = process.env.PORT || 3002;

app.get('/api/clientes', async (req, res) => {
    try {
        const registros = await Cliente.findAll();
        res.json(registros);
    } catch (error) {
        console.error('❌ Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes' });
    }
});

app.post('/api/clientes', async (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
    }

    try {
        const nuevoCliente = await Cliente.create({ nombre });
        res.status(201).json(nuevoCliente);
    } catch (error) {
        console.error('❌ Error al crear cliente:', error);
        res.status(500).json({ error: 'Error al insertar el registro en la base de datos' });
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada. Este servidor solo expone rutas /api/clientes."
    });
});

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        await sequelize.sync({ alter: true });

        app.listen(PORT, () => {
            console.log(`✨ Servidor corriendo en http://localhost:${PORT}`);
            console.log('✨ Este servidor solo expone la API.');
        });
    } catch (error) {
        console.error('✨ Error al iniciar la aplicación:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;
