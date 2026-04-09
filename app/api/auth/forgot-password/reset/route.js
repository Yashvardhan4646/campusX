import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { sendPasswordResetSuccessEmail } from '@/lib/otp-mailer'
import {
  successResponse,
  errorResponse,
  BadRequestError,
} from '@/lib/api-response'

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse(new BadRequestError('Invalid request body'))
    }

    const { resetToken, newPassword } = body

    if (!resetToken || !newPassword) {
      return errorResponse(new BadRequestError('Reset token and new password are required'))
    }

    // ── Password Validation ──
    // Min 8 chars, 1 uppercase, 1 number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return errorResponse(new BadRequestError('Password must be at least 8 characters long and contain at least one uppercase letter and one number'))
    }

    await connectDB()

    // ── Find user by token and check expiry ──
    console.log('[DEBUG] Searching for user with resetToken:', resetToken)
    const user = await User.findOne({
      resetToken,
      resetTokenExpiry: { $gt: new Date() }
    })
    
    if (!user) {
      const userExistsWithToken = await User.findOne({ resetToken })
      if (userExistsWithToken) {
        console.log('[DEBUG] User found with token but it is EXPIRED. Expiry:', userExistsWithToken.resetTokenExpiry)
      } else {
        console.log('[DEBUG] No user found with this resetToken at all.')
      }
    }

    if (!user) {
      const userExistsWithToken = await User.findOne({ resetToken })
      let debugMsg = `[${new Date().toISOString()}] RESET ATTEMPT: ${resetToken}\n`
      if (userExistsWithToken) {
        debugMsg += `FOUND USER: ${userExistsWithToken.email} but EXPIRED at ${userExistsWithToken.resetTokenExpiry}\n`
      } else {
        debugMsg += `USER NOT FOUND for token\n`
      }
      try {
        fs.appendFileSync(path.join(process.cwd(), 'scratch', 'pw-debug.log'), debugMsg)
      } catch (e) {}
      
      return errorResponse(new BadRequestError('Invalid or expired reset token'))
    }

    // ── Update Password ──
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    
    // Clear reset token fields
    user.resetToken = null
    user.resetTokenExpiry = null
    
    // Increment tokenVersion to force logout from other devices if necessary
    user.tokenVersion = (user.tokenVersion || 0) + 1
    
    await user.save()

    // ── Send Confirmation Email ──
    await sendPasswordResetSuccessEmail(user.email)

    return successResponse({
      success: true,
      message: 'Password reset successful'
    })

  } catch (error) {
    console.error('[forgot-password/reset] Error:', error)
    return errorResponse(error)
  }
}
