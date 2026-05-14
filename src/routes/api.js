const express = require('express');
const router = express.Router();

// Not done yet because taskController.js and noteController.js are not finished
// const taskController = require('../controllers/taskController');
// const noteController = require('../controllers/noteController');
 
router.get('/health', (req, res) => {
  res.json({ status: 'Notable API is running!' });
});

// TASK ROUTES 
// Not done yet because taskController.js is not finished
// router.post('/tasks', (req, res) => taskController.createTask(req, res));
// router.get('/tasks/:userId', (req, res) => taskController.getTasksByUser(req, res));
// router.put('/tasks/:id', (req, res) => taskController.updateTask(req, res));
// router.patch('/tasks/:id/complete', (req, res) => taskController.markComplete(req, res));
// router.delete('/tasks/:id', (req, res) => taskController.deleteTask(req, res));
// router.get('/tasks/bhps/:userId', (req, res) => taskController.getTasksByBHPS(req, res));

// NOTE ROUTES 
// Not done yet because noteController.js is not finished
// router.post('/notes', (req, res) => noteController.createNote(req, res));
// router.get('/notes/:userId', (req, res) => noteController.getNotesByUser(req, res));
// router.get('/notes/task/:todoId', (req, res) => noteController.getNotesByTask(req, res));
// router.put('/notes/:id', (req, res) => noteController.updateNote(req, res));
// router.patch('/notes/:id/link', (req, res) => noteController.linkNoteToTask(req, res));
// router.delete('/notes/:id', (req, res) => noteController.deleteNote(req, res));

module.exports = router;