
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;


let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}

async function dbConnect() {

    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        throw new Error("Please define MONGODB_URI in .env.local");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default dbConnect;
