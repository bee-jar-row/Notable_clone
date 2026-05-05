const Folder = require('../repositories/folderRepository');
const Notebook = require('../repositories/notebookRepository');

class WorkspaceService {
  static getAllFolders(userId) {
    const folders = Folder.findAllByUser(userId);
    return { status: 200, body: { folders } };
  }

  static createFolder(userId, body) {
    const { title } = body;
    if (!title) {
      return { status: 400, body: { message: 'Title is required!' } };
    }

    const folderId = Folder.create(userId, title);
    return { status: 201, body: { message: 'Folder created!', folderId } };
  }

  static updateFolder(userId, folderId, body) {
    const { title } = body;
    const folder = Folder.findByIdAndUser(folderId, userId);
    if (!folder) {
      return { status: 404, body: { message: 'Folder not found!' } };
    }

    Folder.update(folderId, userId, title);
    return { status: 200, body: { message: 'Folder updated!' } };
  }

  static deleteFolder(userId, folderId) {
    const folder = Folder.findByIdAndUser(folderId, userId);
    if (!folder) {
      return { status: 404, body: { message: 'Folder not found!' } };
    }

    Folder.delete(folderId, userId);
    return { status: 200, body: { message: 'Folder deleted!' } };
  }

  static getFolderNotebooks(userId, folderId) {
    const folder = Folder.findByIdAndUser(folderId, userId);
    if (!folder) {
      return { status: 404, body: { message: 'Folder not found!' } };
    }

    const notebooks = Notebook.findByFolderAndUser(folderId, userId);
    return { status: 200, body: { notebooks } };
  }
}

module.exports = WorkspaceService;
