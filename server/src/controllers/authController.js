const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const debugLogger = require('../utils/debugLogger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  debugLogger.info('User registration attempt', { email: req.body.email });
  
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    debugLogger.warn('Registration failed - email already exists', { email });
    return next(new AppError('User already exists with this email', 400));
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password
  });
  
  // Generate token
  const token = user.generateAuthToken();
  
  debugLogger.info('User registered successfully', { userId: user._id });
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  debugLogger.info('Login attempt', { email: req.body.email });
  
  const { email, password } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    debugLogger.warn('Login failed - user not found', { email });
    return next(new AppError('Invalid credentials', 401));
  }
  
  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  
  if (!isPasswordMatch) {
    debugLogger.warn('Login failed - invalid password', { email });
    return next(new AppError('Invalid credentials', 401));
  }
  
  // Generate token
  const token = user.generateAuthToken();
  
  debugLogger.info('User logged in successfully', { userId: user._id });
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

module.exports = {
  register,
  login,
  getMe
};