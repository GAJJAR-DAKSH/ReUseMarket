const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable public DNS to prevent ISP querySrv ECONNREFUSED on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported in environment
}

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reusemarket';
  
  try {
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/[^@]*@/, '//***:***@')}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.warn(`Direct MongoDB connection failed: ${err.message}`);
    
    // Attempt fallback to mongodb-memory-server for frictionless zero-config local testing
    try {
      console.log('Attempting to initialize in-memory MongoDB fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`Connected to fallback In-Memory MongoDB at ${memUri}`);
      console.log('Note: To persist data across server restarts, set MONGODB_URI in server/.env with your local or Atlas MongoDB URI.');
    } catch (fallbackErr) {
      console.error('Failed to initialize MongoDB connection or fallback:', fallbackErr.message);
      console.error('Please make sure MongoDB is running locally or specify a valid MONGODB_URI in server/.env');
      throw err;
    }
  }
};

module.exports = connectDB;

