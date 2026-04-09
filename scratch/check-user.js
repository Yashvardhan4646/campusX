import connectDB from './lib/db.js'
import User from './models/User.js'
import dotenv from 'dotenv'

dotenv.config()

async function checkUser(email) {
  await connectDB()
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    console.log('User not found')
  } else {
    console.log('User found:')
    console.log('Email:', user.email)
    console.log('Reset Token:', user.resetToken)
    console.log('Reset Token Expiry:', user.resetTokenExpiry)
    console.log('Is Expiry valid?', user.resetTokenExpiry > new Date() ? 'Yes' : 'No')
  }
  process.exit(0)
}

const email = process.argv[2]
if (!email) {
  console.log('Please provide an email')
  process.exit(1)
}

checkUser(email)
