const Notebook = require('../repositories/notebookRepository');
const Folder = require('../repositories/folderRepository');
const path = require('path');
const fs = require('fs');

const COVER_TYPES = new Set(['default', 'color', 'image']);
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const uploadDir = path.join(__dirname, '../../uploads');

function deleteCoverFile(notebook) {
  if (!notebook?.cover_image_filename) return;

  const filePath = path.join(uploadDir, notebook.cover_image_filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function deleteUploadedFile(file) {
  if (!file?.path) return;
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}

function resolveCoverInput(req, { preserveWhenMissing = false } = {}) {
  const rawType = req.file
    ? 'image'
    : req.body.cover_type || (req.body.cover_color ? 'color' : '');

  if (!rawType && preserveWhenMissing) {
    return { shouldUpdateCover: false };
  }

  const coverType = rawType || 'default';
  if (!COVER_TYPES.has(coverType)) {
    return { error: { status: 400, body: { message: 'Invalid notebook cover type.' } } };
  }

  if (coverType === 'image') {
    if (!req.file) {
      return { error: { status: 400, body: { message: 'Notebook cover image is required.' } } };
    }

    return {
      shouldUpdateCover: true,
      cover: {
        cover_type: 'image',
        cover_image_filename: req.file.filename,
        cover_image_original_name: req.file.originalname,
        cover_image_mimetype: req.file.mimetype,
        cover_image_size: req.file.size
      }
    };
  }

  if (coverType === 'color') {
    const color = req.body.cover_color;
    if (!HEX_COLOR_RE.test(color || '')) {
      return { error: { status: 400, body: { message: 'Notebook cover color must be a valid hex color.' } } };
    }

    return {
      shouldUpdateCover: true,
      cover: {
        cover_type: 'color',
        cover_color: color.toUpperCase()
      }
    };
  }

  return {
    shouldUpdateCover: true,
    cover: { cover_type: 'default' }
  };
}

class NotebookController {
  // Get all notebooks for the logged-in user
  static getAll(req, res) {
    try {
      const notebooks = Notebook.findAllByUser(req.userId);
      res.json({ notebooks });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Create a new notebook
  static create(req, res) {
    try {
      const { title, folder_id } = req.body;
      if (!title) {
        deleteUploadedFile(req.file);
        return res.status(400).json({ message: 'Title is required!' });
      }

      if (folder_id && !Folder.findByIdAndUser(folder_id, req.userId)) {
        deleteUploadedFile(req.file);
        return res.status(404).json({ message: 'Folder not found!' });
      }

      const coverInput = resolveCoverInput(req);
      if (coverInput.error) {
        deleteUploadedFile(req.file);
        return res.status(coverInput.error.status).json(coverInput.error.body);
      }

      const notebookId = Notebook.create(req.userId, title, folder_id || null, coverInput.cover);
      res.status(201).json({ message: 'Notebook created!', notebookId });
    } catch (error) {
      deleteUploadedFile(req.file);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update a notebook
  static update(req, res) {
    try {
      const { title, folder_id } = req.body;
      const notebook = Notebook.findByIdAndUser(req.params.id, req.userId);
      if (!notebook) {
        deleteUploadedFile(req.file);
        return res.status(404).json({ message: 'Notebook not found!' });
      }

      if (folder_id && !Folder.findByIdAndUser(folder_id, req.userId)) {
        deleteUploadedFile(req.file);
        return res.status(404).json({ message: 'Folder not found!' });
      }

      const coverInput = resolveCoverInput(req, { preserveWhenMissing: true });
      if (coverInput.error) {
        deleteUploadedFile(req.file);
        return res.status(coverInput.error.status).json(coverInput.error.body);
      }

      Notebook.update(req.params.id, req.userId, title, folder_id || null);
      if (coverInput.shouldUpdateCover) {
        Notebook.updateCover(req.params.id, req.userId, coverInput.cover);
        deleteCoverFile(notebook);
      }

      res.json({ message: 'Notebook updated!' });
    } catch (error) {
      deleteUploadedFile(req.file);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static cover(req, res) {
    try {
      const notebook = Notebook.findByIdAndUser(req.params.id, req.userId);
      if (!notebook || notebook.cover_type !== 'image' || !notebook.cover_image_filename) {
        return res.status(404).json({ message: 'Notebook cover not found!' });
      }

      const filePath = path.join(uploadDir, notebook.cover_image_filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Cover file not found on server!' });
      }

      res.setHeader('Content-Type', notebook.cover_image_mimetype || 'application/octet-stream');
      return res.sendFile(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete a notebook
  static delete(req, res) {
    try {
      const notebook = Notebook.findByIdAndUser(req.params.id, req.userId);
      if (!notebook) {
        return res.status(404).json({ message: 'Notebook not found!' });
      }
      deleteCoverFile(notebook);
      Notebook.delete(req.params.id, req.userId);
      res.json({ message: 'Notebook deleted!' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = NotebookController;
