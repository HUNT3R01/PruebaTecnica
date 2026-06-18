DROP TABLE usuarios
DROP TABLE tareas

-- 1. Crear tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Almacenará el hash de la contraseña
    rol VARCHAR(20) NOT NULL CONSTRAINT chk_rol CHECK (rol IN ('Administrador', 'Usuario Normal'))
);

-- 2. Crear tabla de Tareas con la restricción de fechas requerida
CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente' CONSTRAINT chk_estado CHECK (estado IN ('Pendiente', 'Completada')),
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    usuario_id INT NOT NULL,
    
    -- Llave foránea que conecta con la tabla de usuarios
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Restricción de Integridad del documento: vencimiento no puede ser anterior a la creación
    CONSTRAINT chk_fechas_coherentes CHECK (fecha_vencimiento >= fecha_creacion)
);

-- Inserción de 3 usuarios de prueba (1 Admin y 2 Normales)
INSERT INTO usuarios (username, password, rol) VALUES
('admin_user', 'admin123_hash', 'Administrador'),
('juan_perez', 'juan123_hash', 'Usuario Normal'),
('maria_gomez', 'maria123_hash', 'Usuario Normal');

-- Inserción corregida de las 5 tareas de prueba
INSERT INTO tareas (titulo, estado, fecha_creacion, fecha_vencimiento, usuario_id) VALUES
('Configurar repositorio de GitHub', 'Completada', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 1),
('Diseñar componentes de React', 'Pendiente', CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days', 2),
('Crear endpoints de la API', 'Pendiente', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 2),
-- Tarea atrasada válida (Creada hace 5 días, venció hace 1 día):
('Conectar localStorage para respaldo', 'Pendiente', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '1 day', 3), 
('Revisar despliegue en producción', 'Pendiente', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 3);
