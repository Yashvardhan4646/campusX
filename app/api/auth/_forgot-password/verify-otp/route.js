import connectDB from '@/lib/db'
import Otp from '@/models/Otp'
import User from '@/models/User'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
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

    const { email, otp } = body
    const purpose = 'forgot_password'

    if (!email || !otp) {
      return errorResponse(new BadRequestError('Email and OTP are required'))
    }

    const normalizedEmail = email.toLowerCase().trim()

    await connectDB()

    // ── Verify OTP ──
    const otpRecord = await Otp.findOne({ 
      email: normalizedEmail, 
      otp, 
      purpose 
    })

    if (!otpRecord) {
      return errorResponse(new BadRequestError('Invalid or expired OTP'))
    }

    // ── Find User ──
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      // This should ideally not happen if they got an OTP, but just in case
      return errorResponse(new BadRequestError('User not found'))
    }

    // ── Generate Reset Token ──
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save to user - Use updateOne to bypass any potential schema instance caching issues
    await User.updateOne(
      { _id: user._id },
      { 
        resetToken, 
        resetTokenExpiry 
      }
    )

    // ── Delete OTP Record ──
    await Otp.deleteOne({ _id: otpRecord._id })

    return successResponse({
      success: true,
      resetToken,
      message: 'OTP verified successfully'
    })

  } catch (error) {
    console.error('[forgot-password/verify-otp] Error:', error)
    return errorResponse(error)
  }
}
