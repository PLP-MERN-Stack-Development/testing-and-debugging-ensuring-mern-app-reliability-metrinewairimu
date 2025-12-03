const mongoose = require('mongoose');
const debugLogger = require('../utils/debugLogger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    debugLogger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    debugLogger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;