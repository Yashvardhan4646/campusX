import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { validateObjectId } from '@/utils/validators'

export async function POST(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ message: 'User ID required' }, { status: 400 })
    }

    if (!validateObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 })
    }

    if (userId === currentUser._id.toString()) {
      return NextResponse.json({ message: 'Cannot mute yourself' }, { status: 400 })
    }

    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const user = await User.findById(currentUser._id)

    if (user.mutedUsers.some(id => id.toString() === userId)) {
      return NextResponse.json({ message: 'User already muted' }, { status: 400 })
    }

    user.mutedUsers.push(userId)
    await user.save()

    return NextResponse.json({ message: 'User muted successfully' })
  } catch (error) {
    console.error('[MuteUserPOST] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}