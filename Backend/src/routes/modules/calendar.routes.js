const express = require('express');
const GoogleCalendarController = require('../../controllers/googleCalendarController');
const authMiddleware = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/auth', authMiddleware, GoogleCalendarController.getAuthUrl);
router.get('/callback', GoogleCalendarController.handleCallback);
router.get('/events', authMiddleware, GoogleCalendarController.getEvents);

module.exports = router;
