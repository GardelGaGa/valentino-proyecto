CREATE DATABASE IF NOT EXISTS focuslab;
USE focuslab;

-- =========================
-- 👤 USUARIOS
-- =========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 📋 TAREAS (tipo Notion)
-- =========================
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    description TEXT,
    status ENUM('pendiente', 'en_progreso', 'hecho') DEFAULT 'pendiente',
    priority ENUM('baja', 'media', 'alta') DEFAULT 'media',
    procrastination_level INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- ⏱️ SESIONES POMODORO
-- =========================
CREATE TABLE pomodoro_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    focus_minutes INT DEFAULT 25,
    break_minutes INT DEFAULT 5,
    cycles INT DEFAULT 1,
    distractions INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 📊 TRACKER DE PRODUCTIVIDAD
-- =========================
CREATE TABLE productivity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    focus_score INT, -- 0 a 100
    tasks_completed INT DEFAULT 0,
    time_focused INT DEFAULT 0, -- minutos
    procrastination_score INT DEFAULT 0,
    date DATE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 🚨 DISTRACCIONES (tipo Forest anti-procrastinación)
-- =========================
CREATE TABLE distractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(100), -- ej: "instagram", "youtube"
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 🧠 MODO FOCUS (sesiones profundas)
-- =========================
CREATE TABLE focus_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    deep_work_score INT DEFAULT 0,
    interruptions INT DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);