const { body, validationResult } = require('express-validator');

// Handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register validation rules
const registerRules = [
  body('name').notEmpty().withMessage('Name is required!'),
  body('email').isEmail().withMessage('Invalid email format!'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters!'),
  body('display_name').optional()
];

// Login validation rules
const loginRules = [
  body('email').isEmail().withMessage('Invalid email format!'),
  body('password').notEmpty().withMessage('Password is required!')
];

// Todo validation rules
const todoRules = [
  body('title').notEmpty().withMessage('Title is required!'),
  body('deadline').isISO8601().withMessage('Invalid deadline format! Use YYYY-MM-DD'),
  body('academic_weight')
    .isFloat({ min: 1, max: 10 })
    .withMessage('Academic weight must be between 1 and 10!'),
  body('estimated_effort')
    .isFloat({ min: 1, max: 10 })
    .withMessage('Estimated effort must be between 1 and 10!'),
  body('folder_id').optional({ nullable: true, checkFalsy: true }).isString(),
  body('notebook_id').optional({ nullable: true, checkFalsy: true }).isString(),
  body('reminder_at').optional({ nullable: true, checkFalsy: true }).isISO8601()
    .withMessage('Invalid reminder format!')
];

// Note validation rules
const noteRules = [
  body('title').notEmpty().withMessage('Title is required!'),
  body('content').notEmpty().withMessage('Content is required!'),
  body('todo_id').optional()
];

module.exports = { validate, registerRules, loginRules, todoRules, noteRules };
