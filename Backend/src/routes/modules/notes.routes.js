const express = require('express');
const NoteController = require('../../controllers/noteController');
const authMiddleware = require('../../utils/authMiddleware');
const { validate, noteRules } = require('../../utils/validator');

const router = express.Router();

router.get('/', authMiddleware, NoteController.getAll);
router.post('/', authMiddleware, noteRules, validate, NoteController.create);
router.patch('/:id', authMiddleware, noteRules, validate, NoteController.update);
router.delete('/:id', authMiddleware, NoteController.delete);

module.exports = router;
