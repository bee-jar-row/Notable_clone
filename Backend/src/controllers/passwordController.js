const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../repositories/userRepository');

class PasswordController {
  // Request password reset
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: 'If that email exists, a reset link has been sent!' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      // Save token to database
      User.saveResetToken(email, resetToken, expiry);

      const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
      const resetLink = `${frontendUrl}/new-password?token=${resetToken}`;

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Notable - Password Reset Request',
          html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset for your Notable account.</p>
            <p>Click the link below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetLink}">Reset Password</a>
            <p>If you didn't request this, ignore this email.</p>
          `
        });

        return res.json({ message: 'If that email exists, a reset link has been sent!' });
      }

      res.json({
        message: 'Local reset token generated.',
        resetToken,
        resetLink
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Reset password with token
  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      if (!token) {
        return res.status(400).json({ message: 'Reset token is required!' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters!' });
      }

      // Find user by token
      const user = User.findByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token!' });
      }

      // Check if token is expired
      const now = new Date();
      const expiry = new Date(user.reset_token_expiry);
      if (now > expiry) {
        return res.status(400).json({ message: 'Reset token has expired!' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update password
      User.updatePassword(user.id, passwordHash);

      res.json({ message: 'Password reset successful!' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = PasswordController;
