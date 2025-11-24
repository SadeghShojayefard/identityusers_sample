import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// To avoid multiple connections, we use a variable to store the connection state
let cached = global as typeof globalThis & {
    mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cached.mongoose) {
    cached.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
    if (cached.mongoose?.conn) {
        return cached.mongoose.conn;
    }

    if (!cached.mongoose?.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.mongoose!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.mongoose!.conn = await cached.mongoose!.promise;
        return cached.mongoose!.conn;
    } catch (error) {
        cached.mongoose!.promise = null;
        throw error;
    }
}

export default dbConnect;
