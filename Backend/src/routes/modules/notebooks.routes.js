const express = require('express');
const NotebookController = require('../../controllers/notebookController');
const authMiddleware = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, NotebookController.getAll);
router.post('/', authMiddleware, NotebookController.create);
router.patch('/:id', authMiddleware, NotebookController.update);
router.delete('/:id', authMiddleware, NotebookController.delete);

module.exports = router;
