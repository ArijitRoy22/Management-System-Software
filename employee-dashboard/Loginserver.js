require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
    origin: true, // Allow only your frontend app
    methods: ['GET', 'POST'],
    credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Load secrets from the environment file
const JWT_SECRET = process.env.JWT_SECRET;
const CSRF_SECRET = process.env.CSRF_SECRET;
console.log(JWT_SECRET)

if (!JWT_SECRET || !CSRF_SECRET) {
    throw new Error('JWT_SECRET and CSRF_SECRET must be set in the .env file');
}

app.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear authentication token
    res.clearCookie('role'); // Clear role cookie
    res.clearCookie('csrfToken')
    res.status(200).json({ message: 'Logged out successfully' });
});

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

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'Strict',
                maxAge: 3600000,
            });

            res.cookie('role', user.role, {
                httpOnly: false, // Allow frontend access
                secure: false,
                sameSite: 'Strict',
                maxAge: 3600000,
            });

            res.cookie('csrfToken', csrfToken, {
                httpOnly: false,
                secure: false,
                sameSite: 'Strict',
                maxAge: 3600000,
            });

            console.log('Cookies sent:', { role: user.role, csrfToken }); // Debugging

            res.json({ message: 'Login successful' });
        });
    });
});


// Verify token middleware
function verifyToken(req, res, next) {
    const token = req.cookies.token;

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


app.listen(5002, () => {
    console.log('Server running on port 5002');
});
