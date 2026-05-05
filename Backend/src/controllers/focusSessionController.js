const FocusService = require('../services/focus.service');

function sendResult(res, result) {
  return res.status(result.status).json(result.body);
}

class FocusSessionController {
  static start(req, res) {
    try {
      return sendResult(res, FocusService.start(req.userId, req.body));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static end(req, res) {
    try {
      return sendResult(res, FocusService.end(req.userId, req.params.id));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static update(req, res) {
    try {
      return sendResult(res, FocusService.update(req.userId, req.params.id, req.body));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static getSummary(req, res) {
    try {
      return sendResult(res, FocusService.getSummary(req.userId, req.params.id));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static getAll(req, res) {
    try {
      return sendResult(res, FocusService.getAll(req.userId));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static getRecommended(req, res) {
    try {
      return sendResult(res, FocusService.getRecommended(req.userId));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = FocusSessionController;
