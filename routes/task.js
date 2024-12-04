const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to authenticate user
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, 'secret'); // Use same secret as in login
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to check if the user is an Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

// Create Task (Admin Only)
router.post('/', authenticate, isAdmin, async (req, res) => {
    const { title, description, assignedTo } = req.body;

    try {
        const task = new Task({ 
            title, 
            description, 
            assignedTo, 
            createdBy: req.user.id 
        });
        await task.save();
        res.status(201).json({ message: 'Task created successfully', task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Tasks (Admin can see all, User sees their own)
router.get('/', authenticate, async (req, res) => {
    try {
        const tasks = req.user.role === 'Admin' 
            ? await Task.find().populate('assignedTo', 'username email')
            : await Task.find({ assignedTo: req.user.id });

        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Task Status (User or Admin)
router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        // Allow only Admin or the assigned user to update the status
        if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        task.status = status;
        await task.save();
        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Task (Admin Only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findByIdAndDelete(id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
