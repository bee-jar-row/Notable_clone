const express = require('express');
const UserController = require('../../controllers/userController');
const authMiddleware = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, UserController.getProfile);
router.patch('/profile', authMiddleware, UserController.updateProfile);
router.patch('/password', authMiddleware, UserController.changePassword);

module.exports = router;
