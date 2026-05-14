const express = require('express');
const NotebookController = require('../../controllers/notebookController');
const authMiddleware = require('../../utils/authMiddleware');
const coverUpload = require('../../utils/coverUploadMiddleware');

const router = express.Router();

router.get('/', authMiddleware, NotebookController.getAll);
router.post('/', authMiddleware, coverUpload, NotebookController.create);
router.get('/:id/cover', authMiddleware, NotebookController.cover);
router.patch('/:id', authMiddleware, coverUpload, NotebookController.update);
router.delete('/:id', authMiddleware, NotebookController.delete);

module.exports = router;
