const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../repositories/userRepository');

class AuthController {
// Register a new user
  static async register(req, res) {
    try {
      const { name, email, password, display_name } = req.body;

// Check if email is already registered
      const existingUser = User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered!' });
      }

// Hash the password before saving
      const passwordHash = await bcrypt.hash(password, 10);

// Save user to database
      const userId = User.create(name, email, passwordHash, display_name);

      res.status(201).json({ message: 'Registration successful!', userId });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

// Login an existing user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

// Check if user exists
      const user = User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password!' });
      }

// Validate password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid email or password!' });
      }

// Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          display_name: user.display_name
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = AuthController;