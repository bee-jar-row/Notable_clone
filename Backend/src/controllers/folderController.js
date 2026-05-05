const WorkspaceService = require('../services/workspace.service');

function sendResult(res, result) {
  return res.status(result.status).json(result.body);
}

class FolderController {
  static getAll(req, res) {
    try {
      return sendResult(res, WorkspaceService.getAllFolders(req.userId));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static create(req, res) {
    try {
      return sendResult(res, WorkspaceService.createFolder(req.userId, req.body));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static update(req, res) {
    try {
      return sendResult(res, WorkspaceService.updateFolder(req.userId, req.params.id, req.body));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static delete(req, res) {
    try {
      return sendResult(res, WorkspaceService.deleteFolder(req.userId, req.params.id));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static getNotebooks(req, res) {
    try {
      return sendResult(res, WorkspaceService.getFolderNotebooks(req.userId, req.params.id));
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = FolderController;
