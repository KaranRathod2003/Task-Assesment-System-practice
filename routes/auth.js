const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {

        if (!['Admin', 'User'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role selected' });
        }
        const user = new User({ username, email, password, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
        res.redirect('/login');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
        res.render('task_form');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;



router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login'));
