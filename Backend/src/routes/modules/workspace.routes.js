const express = require('express');
const FolderController = require('../../controllers/folderController');
const authMiddleware = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, FolderController.getAll);
router.post('/', authMiddleware, FolderController.create);
router.patch('/:id', authMiddleware, FolderController.update);
router.delete('/:id', authMiddleware, FolderController.delete);
router.get('/:id/notebooks', authMiddleware, FolderController.getNotebooks);

module.exports = router;
