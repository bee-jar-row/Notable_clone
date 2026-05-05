const bcrypt = require('bcryptjs');
const User = require('../repositories/userRepository');

function normalizeGoogleCalendarEmbedUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const isGoogleCalendarEmbed = url.protocol === 'https:'
      && url.hostname === 'calendar.google.com'
      && url.pathname === '/calendar/embed';

    return isGoogleCalendarEmbed ? url.toString() : false;
  } catch {
    return false;
  }
}

class UserService {
  static getProfile(userId) {
    const user = User.findPublicById(userId);
    if (!user) {
      return { status: 404, body: { message: 'User not found!' } };
    }

    return { status: 200, body: { user } };
  }

  static updateProfile(userId, body) {
    const { name, display_name, gcal_url } = body;
    if (!name) {
      return { status: 400, body: { message: 'Name is required!' } };
    }

    const normalizedGcalUrl = normalizeGoogleCalendarEmbedUrl(gcal_url);
    if (normalizedGcalUrl === false) {
      return {
        status: 400,
        body: { message: 'Google Calendar URL must be a public calendar embed URL!' }
      };
    }

    const user = User.findById(userId);
    if (!user) {
      return { status: 404, body: { message: 'User not found!' } };
    }

    User.updateProfile(userId, name, display_name, normalizedGcalUrl);
    return { status: 200, body: { message: 'Profile updated successfully!' } };
  }

  static async changePassword(userId, body) {
    const { current_password, new_password } = body;
    if (!current_password || !new_password) {
      return {
        status: 400,
        body: { message: 'Current password and new password are required!' }
      };
    }
    if (new_password.length < 6) {
      return {
        status: 400,
        body: { message: 'New password must be at least 6 characters!' }
      };
    }

    const user = User.findById(userId);
    if (!user) {
      return { status: 404, body: { message: 'User not found!' } };
    }

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return { status: 400, body: { message: 'Current password is incorrect!' } };
    }

    const passwordHash = await bcrypt.hash(new_password, 10);
    User.updatePassword(userId, passwordHash);
    return { status: 200, body: { message: 'Password updated successfully!' } };
  }
}

module.exports = UserService;
