const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const debugLogger = {
  info: (message, data = {}) => {
    const log = `[INFO] ${new Date().toISOString()}: ${message} ${JSON.stringify(data)}\n`;
    console.log(log);
    fs.appendFileSync(path.join(logDir, 'app.log'), log);
  },
  
  error: (message, error, context = {}) => {
    const log = `[ERROR] ${new Date().toISOString()}: ${message}\nError: ${error.message}\nStack: ${error.stack}\nContext: ${JSON.stringify(context)}\n`;
    console.error(log);
    fs.appendFileSync(path.join(logDir, 'error.log'), log);
  },
  
  warn: (message, data = {}) => {
    const log = `[WARN] ${new Date().toISOString()}: ${message} ${JSON.stringify(data)}\n`;
    console.warn(log);
    fs.appendFileSync(path.join(logDir, 'app.log'), log);
  },
  
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const log = `[DEBUG] ${new Date().toISOString()}: ${message} ${JSON.stringify(data)}\n`;
      console.debug(log);
      fs.appendFileSync(path.join(logDir, 'debug.log'), log);
    }
  }
};

module.exports = debugLogger;