const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    return next(new AppError('Validation failed', 400, errorMessages));
  }
  
  next();
};

const bugValidationRules = () => {
  return [
    require('express-validator').body('title')
      .notEmpty().withMessage('Title is required')
      .trim()
      .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    
    require('express-validator').body('description')
      .notEmpty().withMessage('Description is required')
      .trim()
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    
    require('express-validator').body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
    
    require('express-validator').body('status')
      .optional()
      .isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status'),
    
    require('express-validator').body('reportedBy')
      .notEmpty().withMessage('Reporter name is required')
      .trim()
      .isLength({ max: 50 }).withMessage('Reporter name cannot exceed 50 characters')
  ];
};

const authValidationRules = () => {
  return [
    require('express-validator').body('email')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    require('express-validator').body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ];
};

module.exports = {
  validateRequest,
  bugValidationRules,
  authValidationRules
};