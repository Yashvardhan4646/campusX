import mongoose from 'mongoose'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

let lastConnectedAt = null
let lastError = null

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  // ✅ Cached connection return karo
  if (cached.conn) return cached.conn

  // ✅ Agar connection chal raha hai toh wait karo
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
    }).then((mongoose) => {
      lastConnectedAt = new Date()
      lastError = null
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    lastError = error
    throw error
  }

  return cached.conn
}

export function getDBStatus() {
  const readyState = mongoose.connection.readyState
  const state =
    readyState === 0 ? 'disconnected' :
      readyState === 1 ? 'connected' :
        readyState === 2 ? 'connecting' :
          readyState === 3 ? 'disconnecting' :
            'unknown'

  return {
    state,
    readyState,
    lastConnectedAt: lastConnectedAt ? lastConnectedAt.toISOString() : null,
    lastError: lastError ? (lastError.message || String(lastError)) : null
  }
}

export default connectDB