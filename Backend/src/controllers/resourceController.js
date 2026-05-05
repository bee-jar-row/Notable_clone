const Resource = require('../repositories/resourceRepository');
const Notebook = require('../repositories/notebookRepository');
const Chapter = require('../repositories/chapterRepository');
const path = require('path');
const fs = require('fs');

class ResourceController {
  // Upload a resource
  static upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded!' });
      }

      const { notebook_id, chapter_id } = req.body;
      if (!notebook_id && !chapter_id) {
        return res.status(400).json({ message: 'Notebook or chapter is required!' });
      }
      if (notebook_id && !Notebook.findByIdAndUser(notebook_id, req.userId)) {
        return res.status(404).json({ message: 'Notebook not found!' });
      }
      if (chapter_id && !Chapter.findByIdAndUser(chapter_id, req.userId)) {
        return res.status(404).json({ message: 'Chapter not found!' });
      }

      const resourceId = Resource.create(
        req.userId,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        notebook_id || null,
        chapter_id || null
      );

      res.status(201).json({
        message: 'Resource uploaded!',
        resourceId,
        filename: req.file.filename,
        original_name: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all resources for the logged-in user
  static getAll(req, res) {
    try {
      const resources = Resource.findAllByUser(req.userId);
      res.json({ resources });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get resources by notebook
  static getByNotebook(req, res) {
    try {
      const resources = Resource.findByNotebookAndUser(req.params.notebookId, req.userId);
      res.json({ resources });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get resources by chapter
  static getByChapter(req, res) {
    try {
      const resources = Resource.findByChapterAndUser(req.params.chapterId, req.userId);
      res.json({ resources });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Download a resource
  static download(req, res) {
    try {
      const resource = Resource.findByIdAndUser(req.params.id, req.userId);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found!' });
      }

      const filePath = path.join(__dirname, '../../uploads/', resource.filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server!' });
      }

      res.download(filePath, resource.original_name);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete a resource
  static delete(req, res) {
    try {
      const resource = Resource.findByIdAndUser(req.params.id, req.userId);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found!' });
      }

      // Delete file from disk
      const filePath = path.join(__dirname, '../../uploads/', resource.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      Resource.delete(req.params.id, req.userId);
      res.json({ message: 'Resource deleted!' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = ResourceController;
