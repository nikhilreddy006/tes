const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 👉 Create a User (POST /users)
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required fields' });
    }
    
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    // Handle duplicate email error specifically
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// 👉 Get All Users (GET /users)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(200).json({ message: 'No users found', data: [] });
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 👉 Get One User (GET /users/:id)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

// 👉 Update User (PUT /users/:id)
router.put('/:id', async (req, res) => {
  try {
    // Validate if the request body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body cannot be empty' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// 👉 Delete User (DELETE /users/:id)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

module.exports = router;
