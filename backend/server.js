// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares
app.use(cors()); // Permite que tu frontend en React (ej. localhost:3000) haga peticiones aquí
app.use(express.json()); // Permite a Express entender el cuerpo de los JSON (req.body)

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'prueba_tecnica',
    password: process.env.DB_PASSWORD || '1234', 
    port: process.env.DB_PORT || 5432,
});


pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error adquiriendo el cliente de la BD:', err.stack);
    }
    console.log('¡Conexión exitosa a PostgreSQL!');
    release();
});

// Metodo GET
app.get('/', (req, res) => {
    res.send('Servidor corriendo y listo para la prueba técnica');
});

app.get('/api/tareas', async (req, res) => {
    // React nos enviará estas variables en los "query parameters" (?usuarioId=2&rol=Usuario Normal)
    const { usuarioId, rol } = req.query;

    try {
        let tareas;

        if (rol === 'Administrador') {
            // El Administrador ve absolutamente todo y ordenado por proximidad de vencimiento [cite: 10, 20]
            const result = await pool.query('SELECT * FROM tareas ORDER BY fecha_vencimiento ASC');
            tareas = result.rows;
        } else {
            // El Usuario Normal solo ve las suyas ordenadas por vencimiento 
            const result = await pool.query(
                'SELECT * FROM tareas WHERE usuario_id = $1 ORDER BY fecha_vencimiento ASC',
                [usuarioId]
            );
            tareas = result.rows;
        }

        res.json(tareas);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});

// Metodo POST
app.post('/api/tareas', async (req, res) => {
    const { titulo, fecha_vencimiento, usuario_id } = req.body;

    // Validación manual de fechas antes de tocar la BD 
    const fechaCreacion = new Date(); 
    const fechaVencimiento = new Date(fecha_vencimiento);

    if (fechaVencimiento < fechaCreacion.setHours(0,0,0,0)) {
        return res.status(400).json({ 
            error: 'La fecha de vencimiento no puede ser anterior a la fecha de creación.' 
        });
    }

    try {
        const nuevaTarea = await pool.query(
            'INSERT INTO tareas (titulo, fecha_vencimiento, usuario_id) VALUES ($1, $2, $3) RETURNING *',
            [titulo, fecha_vencimiento, usuario_id]
        );
        res.json(nuevaTarea.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al crear la tarea' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscamos al usuario en la base de datos
        const result = await pool.query(
            'SELECT id, username, rol, password FROM usuarios WHERE username = $1', 
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = result.rows[0];

        // Validación de contraseña básica (plana o hash de prueba)
        if (usuario.password !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Si todo coincide, respondemos con los datos que React necesita
        res.json({
            id: usuario.id,
            username: usuario.username,
            rol: usuario.rol
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error en el servidor al intentar iniciar sesión' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});