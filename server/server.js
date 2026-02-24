/**
 * SERVER.JS - Backend сервер для Maply
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// PostgreSQL подключение
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'travelhub',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// JWT секрет
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

// Конфигурация загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения разрешены'));
        }
    }
});

// Middleware авторизации
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Токен отсутствует' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Недействительный токен' });
    }
};

// Тест подключения к БД
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            success: true, 
            message: 'Подключение к базе данных успешно!',
            time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка подключения к БД', 
            error: error.message 
        });
    }
});

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Заполните все поля' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: 'Пароль должен быть минимум 6 символов' });
        }
        
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email уже зарегистрирован' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );
        
        const user = result.rows[0];
        
        res.status(201).json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Заполните все поля' });
        }
        
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }
        
        const user = result.rows[0];
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }
        
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'Вход выполнен',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получить профиль
app.get('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, avatar, created_at FROM users WHERE id = $1',
            [req.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        res.json({
            success: true,
            user: result.rows[0]
        });
        
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Обновить профиль
app.put('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Имя обязательно' });
        }
        
        const result = await pool.query(
            'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
            [name, req.userId]
        );
        
        res.json({
            success: true,
            message: 'Профиль обновлён',
            user: result.rows[0]
        });
        
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Загрузить аватар
app.post('/api/user/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }
        
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        
        await pool.query(
            'UPDATE users SET avatar = $1 WHERE id = $2',
            [avatarUrl, req.userId]
        );
        
        res.json({
            success: true,
            message: 'Аватар обновлён',
            avatarUrl
        });
        
    } catch (error) {
        console.error('Ошибка загрузки аватара:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     Maply Server запущен!         ║
╠════════════════════════════════════════╣
║  Порт: ${PORT}                        ║
║  URL: http://localhost:${PORT}         ║
║  API: http://localhost:${PORT}/api     ║
╚════════════════════════════════════════╝
    `);
});