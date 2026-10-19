-- =========================================================
-- Base de datos: Pide y Devuelve
-- Servicio de préstamos de: computadoras, calculadoras y
-- libros de la biblioteca de la escuela.
-- Compatible con las entidades JPA del proyecto (Usuario,
-- Recurso, Prestamo) usando PhysicalNamingStrategyStandardImpl,
-- es decir, los nombres de columna quedan EXACTAMENTE como los
-- atributos Java (sin convertir a snake_case).
-- =========================================================

DROP DATABASE IF EXISTS pide_y_devuelve_bd;
CREATE DATABASE pide_y_devuelve_bd
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pide_y_devuelve_bd;

-- ---------------------------------------------------------
-- Tabla: usuarios
-- Entidad: Usuario.java
-- ---------------------------------------------------------
CREATE TABLE usuarios (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(100),
    apellido  VARCHAR(100),
    DNI       INT,
    curso     VARCHAR(50),
    email     VARCHAR(150),
    password  VARCHAR(255),
    activo    BOOLEAN NOT NULL DEFAULT TRUE,
    tipo      ENUM('ALUMNO','DOCENTE','PRECEPTOR','DIRECTIVO') NOT NULL,

    UNIQUE KEY uq_usuarios_email (email),
    UNIQUE KEY uq_usuarios_dni (DNI)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla: recursos
-- Entidad: Recurso.java
-- tipo ahora es un enum en Java (TipoRecurso), reflejado acá
-- como ENUM para forzar sólo los 3 valores permitidos.
-- ---------------------------------------------------------
CREATE TABLE recursos (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(150) NOT NULL,
    codigo  VARCHAR(50)  NOT NULL,
    tipo    ENUM('COMPUTADORA','CALCULADORA','LIBRO') NOT NULL,
    estado  ENUM('DISPONIBLE','NO_DISPONIBLE') NOT NULL DEFAULT 'DISPONIBLE',

    UNIQUE KEY uq_recursos_codigo (codigo)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla: prestamos
-- Entidad: Prestamo.java
-- fechaInicio / fechaDevolucion ahora son LocalDate en Java,
-- así que se mapean como DATE (formato 'YYYY-MM-DD').
-- ---------------------------------------------------------
CREATE TABLE prestamos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    fechaInicio      DATE,
    fechaDevolucion  DATE,
    observaciones    VARCHAR(500),
    estado           ENUM('BUENO','REGULAR','DEFECTUOSO') NOT NULL,

    usuario_id       INT NOT NULL,
    recurso_id       INT NOT NULL,

    CONSTRAINT fk_prestamos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_prestamos_recurso
        FOREIGN KEY (recurso_id) REFERENCES recursos(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_prestamos_usuario ON prestamos(usuario_id);
CREATE INDEX idx_prestamos_recurso ON prestamos(recurso_id);

-- =========================================================
-- DATOS DE PRUEBA (opcional, para probar la API sin cargar
-- todo a mano). Podés borrar este bloque si no lo necesitás.
-- =========================================================

INSERT INTO usuarios (nombre, apellido, DNI, curso, email, password, activo, tipo) VALUES
('Juan',   'Perez',    40111222, '4to 1ra Informática', 'juan.perez@escuela.edu.ar',   '1234', TRUE, 'ALUMNO'),
('Maria',  'Gomez',    40222333, '5to 2da Informática', 'maria.gomez@escuela.edu.ar',  '1234', TRUE, 'ALUMNO'),
('Laura',  'Fernandez', 30111444, NULL,                 'laura.fernandez@escuela.edu.ar', '1234', TRUE, 'DOCENTE'),
('Carlos', 'Diaz',      28999555, NULL,                 'carlos.diaz@escuela.edu.ar',  '1234', TRUE, 'PRECEPTOR');

INSERT INTO recursos (nombre, codigo, tipo, estado) VALUES
('Notebook Exo XL 14 #01',        'PC-001', 'COMPUTADORA', 'DISPONIBLE'),
('Notebook Exo XL 14 #02',        'PC-002', 'COMPUTADORA', 'DISPONIBLE'),
('Calculadora Científica Casio 1', 'CALC-001', 'CALCULADORA', 'DISPONIBLE'),
('Calculadora Científica Casio 2', 'CALC-002', 'CALCULADORA', 'DISPONIBLE'),
('Libro - Matemática 4to año',     'LIB-001', 'LIBRO', 'DISPONIBLE'),
('Libro - Física 5to año',         'LIB-002', 'LIBRO', 'DISPONIBLE');

INSERT INTO prestamos (fechaInicio, fechaDevolucion, observaciones, estado, usuario_id, recurso_id) VALUES
('2026-09-01', NULL,        'Retira para clase de Programación', 'BUENO', 1, 1),
('2026-09-02', '2026-09-02', 'Devuelto en buen estado',            'BUENO', 2, 3);

UPDATE recursos SET estado = 'NO_DISPONIBLE' WHERE id = 1;
