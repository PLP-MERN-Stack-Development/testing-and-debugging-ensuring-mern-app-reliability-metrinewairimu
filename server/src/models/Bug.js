const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  reportedBy: {
    type: String,
    required: [true, 'Reporter name is required'],
    trim: true,
    maxlength: [50, 'Reporter name cannot exceed 50 characters']
  },
  assignedTo: {
    type: String,
    default: 'Unassigned',
    trim: true
  },
  stepsToReproduce: [{
    type: String,
    trim: true
  }],
  environment: {
    os: {
      type: String,
      default: 'Unknown'
    },
    browser: {
      type: String,
      default: 'Unknown'
    },
    version: {
      type: String,
      default: 'Unknown'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update updatedAt timestamp before save
bugSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
bugSchema.index({ status: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('Bug', bugSchema);