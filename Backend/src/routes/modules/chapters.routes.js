const express = require('express');
const ChapterController = require('../../controllers/chapterController');
const authMiddleware = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/notebooks/:notebookId/chapters', authMiddleware, ChapterController.getAll);
router.post('/notebooks/:notebookId/chapters', authMiddleware, ChapterController.create);
router.patch('/chapters/:id', authMiddleware, ChapterController.update);
router.delete('/chapters/:id', authMiddleware, ChapterController.delete);

module.exports = router;
