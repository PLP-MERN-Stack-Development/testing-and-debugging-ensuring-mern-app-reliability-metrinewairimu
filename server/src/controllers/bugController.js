const Bug = require('../models/Bug');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const debugLogger = require('../utils/debugLogger');

// @desc    Get all bugs
// @route   GET /api/bugs
// @access  Public
const getBugs = asyncHandler(async (req, res, next) => {
  debugLogger.info('Fetching bugs', { query: req.query });
  
  // Filtering
  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }
  
  if (req.query.reportedBy) {
    filter.reportedBy = { $regex: req.query.reportedBy, $options: 'i' };
  }
  
  if (req.query.assignedTo) {
    filter.assignedTo = { $regex: req.query.assignedTo, $options: 'i' };
  }
  
  // Sorting
  const sort = {};
  if (req.query.sort) {
    const sortFields = req.query.sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    });
  } else {
    sort.createdAt = -1; // Default sort by newest
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Execute query
  const bugs = await Bug.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Bug.countDocuments(filter);
  
  // Calculate pagination info
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  res.status(200).json({
    success: true,
    count: bugs.length,
    pagination,
    data: bugs
  });
});

// @desc    Get single bug
// @route   GET /api/bugs/:id
// @access  Public
const getBug = asyncHandler(async (req, res, next) => {
  const bug = await Bug.findById(req.params.id);
  
  if (!bug) {
    debugLogger.warn('Bug not found', { id: req.params.id });
    return next(new AppError(`Bug not found with id of ${req.params.id}`, 404));
  }
  
  debugLogger.info('Bug fetched successfully', { id: bug._id });
  res.status(200).json({
    success: true,
    data: bug
  });
});

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Public
const createBug = asyncHandler(async (req, res, next) => {
  debugLogger.info('Creating new bug', { body: req.body });
  
  // Add default values if not provided
  const bugData = {
    ...req.body,
    status: req.body.status || 'open',
    priority: req.body.priority || 'medium',
    assignedTo: req.body.assignedTo || 'Unassigned'
  };
  
  const bug = await Bug.create(bugData);
  
  debugLogger.info('Bug created successfully', { id: bug._id });
  res.status(201).json({
    success: true,
    data: bug
  });
});

// @desc    Update bug
// @route   PUT /api/bugs/:id
// @access  Public
const updateBug = asyncHandler(async (req, res, next) => {
  debugLogger.info('Updating bug', { id: req.params.id, updates: req.body });
  
  let bug = await Bug.findById(req.params.id);
  
  if (!bug) {
    return next(new AppError(`Bug not found with id of ${req.params.id}`, 404));
  }
  
  // Update bug
  bug = await Bug.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  debugLogger.info('Bug updated successfully', { id: bug._id });
  res.status(200).json({
    success: true,
    data: bug
  });
});

// @desc    Update bug status
// @route   PATCH /api/bugs/:id/status
// @access  Public
const updateBugStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status) {
    return next(new AppError('Status is required', 400));
  }
  
  const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
  }
  
  const bug = await Bug.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!bug) {
    return next(new AppError(`Bug not found with id of ${req.params.id}`, 404));
  }
  
  debugLogger.info('Bug status updated', { id: bug._id, status });
  res.status(200).json({
    success: true,
    data: bug
  });
});

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
// @access  Public
const deleteBug = asyncHandler(async (req, res, next) => {
  const bug = await Bug.findById(req.params.id);
  
  if (!bug) {
    return next(new AppError(`Bug not found with id of ${req.params.id}`, 404));
  }
  
  await bug.deleteOne();
  
  debugLogger.info('Bug deleted', { id: req.params.id });
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get bug statistics
// @route   GET /api/bugs/stats/summary
// @access  Public
const getBugStats = asyncHandler(async (req, res, next) => {
  const stats = await Bug.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgPriority: { $avg: { $switch: {
          branches: [
            { case: { $eq: ['$priority', 'critical'] }, then: 4 },
            { case: { $eq: ['$priority', 'high'] }, then: 3 },
            { case: { $eq: ['$priority', 'medium'] }, then: 2 },
            { case: { $eq: ['$priority', 'low'] }, then: 1 }
          ],
          default: 2
        }}}
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  const priorityStats = await Bug.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  const totalBugs = await Bug.countDocuments();
  const openBugs = await Bug.countDocuments({ status: 'open' });
  const resolvedBugs = await Bug.countDocuments({ status: 'resolved' });
  
  res.status(200).json({
    success: true,
    data: {
      totalBugs,
      openBugs,
      resolvedBugs,
      statusDistribution: stats,
      priorityDistribution: priorityStats
    }
  });
});

module.exports = {
  getBugs,
  getBug,
  createBug,
  updateBug,
  updateBugStatus,
  deleteBug,
  getBugStats
};