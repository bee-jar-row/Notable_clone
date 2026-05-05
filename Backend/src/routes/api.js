const express = require('express');
const router = express.Router();

const authRoutes = require('./modules/auth.routes');
const settingsRoutes = require('./modules/settings.routes');
const todoRoutes = require('./modules/todos.routes');
const noteRoutes = require('./modules/notes.routes');
const focusRoutes = require('./modules/focus.routes');
const workspaceRoutes = require('./modules/workspace.routes');
const notebookRoutes = require('./modules/notebooks.routes');
const chapterRoutes = require('./modules/chapters.routes');
const resourceRoutes = require('./modules/resources.routes');
const calendarRoutes = require('./modules/calendar.routes');
const searchRoutes = require('./modules/search.routes');

router.use('/auth', authRoutes);
router.use('/user', settingsRoutes);
router.use('/todos', todoRoutes);
router.use('/notes', noteRoutes);
router.use('/focus-sessions', focusRoutes);
router.use('/folders', workspaceRoutes);
router.use('/notebooks', notebookRoutes);
router.use('/', chapterRoutes);
router.use('/resources', resourceRoutes);
router.use('/calendar', calendarRoutes);
router.use('/search', searchRoutes);

module.exports = router;
