import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

// Connect to MongoDB
const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI not set')
  process.exit(1)
}

await mongoose.connect(uri)
console.log('✅ Connected to MongoDB')

// Import models
import GroupMessage from '../models/GroupMessage.js'
import User from '../models/User.js'

async function main() {
  try {
    // Attempt to query any message with the same population options
    const messages = await GroupMessage.find()
      .sort({ _id: -1 })
      .limit(5)
      .populate('sender', 'name username avatar isVerified')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username' }
      })
      .lean()
    console.log('✅ Query succeeded. Retrieved messages:', messages.length)
    if (messages.length > 0) {
      console.log('Sample message:', JSON.stringify(messages[0], null, 2))
    }
  } catch (err) {
    console.error('❌ Query failed with error:', err)
  } finally {
    await mongoose.connection.close()
  }
}

main()
