import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function dbConnect(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    console.warn(
      '⚠️ MONGODB_URI is not defined in environment variables. Database operations will operate in mock/offline mode.'
    );
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('🔌 Successfully connected to MongoDB via Mongoose');
      return m;
    }).catch(err => {
      console.error('❌ MongoDB Connection Error:', err);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.conn = null;
    cached.promise = null;
    console.error('❌ Failed to establish Mongoose connection:', e);
    return null;
  }

  return cached.conn;
}

export default dbConnect;
