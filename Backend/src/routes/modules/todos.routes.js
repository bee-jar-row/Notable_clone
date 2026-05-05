const express = require('express');
const TodoController = require('../../controllers/todoController');
const authMiddleware = require('../../utils/authMiddleware');
const { validate, todoRules } = require('../../utils/validator');

const router = express.Router();

router.get('/', authMiddleware, TodoController.getAll);
router.post('/', authMiddleware, todoRules, validate, TodoController.create);
router.patch('/:id', authMiddleware, todoRules, validate, TodoController.update);
router.patch('/:id/complete', authMiddleware, TodoController.markComplete);
router.delete('/:id', authMiddleware, TodoController.delete);

module.exports = router;
