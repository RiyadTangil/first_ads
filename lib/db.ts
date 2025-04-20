import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://sadamon:Ri11559988@cluster0.ez5ix.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'client_com';

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(`${MONGODB_URI}`, {
      dbName: DB_NAME
    });
    
    console.log('Connected to MongoDB');
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
} 