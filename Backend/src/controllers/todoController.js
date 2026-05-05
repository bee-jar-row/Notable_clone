const TodoService = require('../services/todo.service');

function sendResult(res, result) {
  return res.status(result.status).json(result.body);
}

class TodoController {
  static getAll(req, res) {
    try {
      return sendResult(res, TodoService.getAll(req.userId, req.query));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static create(req, res) {
    try {
      return sendResult(res, TodoService.create(req.userId, req.body));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static update(req, res) {
    try {
      return sendResult(res, TodoService.update(req.userId, req.params.id, req.body));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static markComplete(req, res) {
    try {
      return sendResult(res, TodoService.markComplete(req.userId, req.params.id));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static delete(req, res) {
    try {
      return sendResult(res, TodoService.delete(req.userId, req.params.id));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = TodoController;
