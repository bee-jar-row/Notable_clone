const express = require('express');
const ResourceController = require('../../controllers/resourceController');
const authMiddleware = require('../../utils/authMiddleware');
const upload = require('../../utils/uploadMiddleware');

const router = express.Router();

router.get('/', authMiddleware, ResourceController.getAll);
router.post('/', authMiddleware, upload.single('file'), ResourceController.upload);
router.get('/notebook/:notebookId', authMiddleware, ResourceController.getByNotebook);
router.get('/chapter/:chapterId', authMiddleware, ResourceController.getByChapter);
router.get('/:id/download', authMiddleware, ResourceController.download);
router.delete('/:id', authMiddleware, ResourceController.delete);

module.exports = router;
