require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ['https://arijitroy22.github.io'], // Allow only your frontend app
    methods: ['GET', 'POST'],
    credentials: false,
}));
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 0,
});

const JWT_SECRET = process.env.JWT_SECRET;
const CSRF_SECRET = process.env.CSRF_SECRET;

if (!JWT_SECRET || !CSRF_SECRET) {
    throw new Error('JWT_SECRET and CSRF_SECRET must be set in the .env file');
}

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.execute(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const user = results[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Error comparing passwords' });
            if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

            const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            const csrfToken = jwt.sign({}, CSRF_SECRET, { expiresIn: '1h' });

            res.json({
                message: 'Login successful',
                token,
                role: user.role,
                csrfToken,
            });
        });
    });
});

// Logout route
app.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

// Verify token middleware
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// CSRF protection middleware
function verifyCsrfToken(req, res, next) {
    const csrfToken = req.headers['x-csrf-token'];

    if (!csrfToken) return res.status(403).json({ error: 'CSRF token missing' });

    jwt.verify(csrfToken, CSRF_SECRET, (err) => {
        if (err) return res.status(403).json({ error: 'Invalid CSRF token' });
        next();
    });
}

// Protected route example
app.get('/protected', verifyToken, verifyCsrfToken, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
