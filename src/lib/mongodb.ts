import { environmentVariables } from '@/config/environment';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (process.env.NODE_ENV === 'production') {
    return new MongoClient(environmentVariables.MONGO_URI);
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(environmentVariables.MONGO_URI)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        throw err; // rethrow to propagate the error
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // reset promise on failure
    throw error;
  }

  return cached.conn;
}
