const UserService = require('../services/user.service');

function sendResult(res, result) {
  return res.status(result.status).json(result.body);
}

class UserController {
  static getProfile(req, res) {
    try {
      return sendResult(res, UserService.getProfile(req.userId));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static updateProfile(req, res) {
    try {
      return sendResult(res, UserService.updateProfile(req.userId, req.body));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async changePassword(req, res) {
    try {
      return sendResult(res, await UserService.changePassword(req.userId, req.body));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = UserController;
