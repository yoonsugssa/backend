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
        // 1. CONEXIÓN Y AUTENTICACIÓN
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        
        // 2. SINCRONIZACIÓN DE TABLAS (CREACIÓN)
        await sequelize.sync({ alter: true }); 
        console.log('🛠 Tablas sincronizadas');
        
        // --- RUTA PRINCIPAL (/) - Muestra la conexión Y los datos ---
        app.get('/', async (req, res) => {
            try {
                const registros = await Cliente.findAll(); 
                
                // Generar una respuesta HTML para mostrar los datos en el navegador
                let htmlResponse = `
                    <html>
                    <head>
                        <title>Servidor y Datos Listos</title>
                        <style>
                            body { font-family: sans-serif; margin: 20px; background-color: #f4f4f9; }
                            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                            h1 { color: #2ecc71; }
                            h2 { color: #34495e; margin-top: 20px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                            .connection-status { background-color: #e6ffe6; border-left: 5px solid #2ecc71; padding: 10px; margin-bottom: 20px; font-weight: bold; }
                            ul { list-style: none; padding: 0; }
                            li { background: #ecf0f1; margin-bottom: 8px; padding: 10px; border-radius: 4px; }
                            .empty { color: #e74c3c; font-style: italic; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="connection-status">
                                ✅ Servidor conectado a la DB. ¡Despliegue exitoso!
                            </div>
                            <h1>Lista de Clientes de PostgreSQL</h1>
                `;

                if (registros && registros.length > 0) {
                    htmlResponse += `
                        <h2>${registros.length} Clientes Encontrados:</h2>
                        <ul>
                    `;
                    registros.forEach(cliente => {
                        htmlResponse += `<li>ID: ${cliente.id} | Nombre: ${cliente.nombre}</li>`;
                    });
                    htmlResponse += `</ul>`;
                } else {
                    htmlResponse += `
                        <h2 class="empty">0 Clientes Encontrados.</h2>
                        <p>Esto significa que la conexión funciona, pero la base de datos de Render está vacía. Debes hacer una solicitud POST o migrar tus datos locales.</p>
                        <p><strong>Ruta POST de ejemplo:</strong> /clientes</p>
                    `;
                }

                htmlResponse += `
                        </div>
                    </body>
                    </html>
                `;

                res.send(htmlResponse);

            } catch (error) {
                console.error('Error al obtener registros en la ruta raíz:', error);
                res.status(500).send(`
                    <html><body>
                        <div style="color: red; padding: 20px; border: 1px solid red;">
                            ❌ ERROR: No se pudieron obtener los datos. Revisa los logs de Render para detalles.
                        </div>
                    </body></html>
                `);
            }
        });
        
        // --- RUTA /clientes (API) - Devuelve JSON ---
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

        // Mantenemos la ruta /clientes para que los clientes de la API sigan funcionando
        app.get('/clientes', async (req, res) => {
            try {
                const registros = await Cliente.findAll(); 
                res.json(registros);
            } catch (error) {
                console.error('Error al obtener registros:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
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
