const express = require('express');
const FocusSessionController = require('../../controllers/focusSessionController');
const authMiddleware = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, FocusSessionController.getAll);
router.get('/recommended', authMiddleware, FocusSessionController.getRecommended);
router.post('/', authMiddleware, FocusSessionController.start);
router.patch('/:id', authMiddleware, FocusSessionController.update);
router.patch('/:id/end', authMiddleware, FocusSessionController.end);
router.get('/:id/summary', authMiddleware, FocusSessionController.getSummary);

module.exports = router;
