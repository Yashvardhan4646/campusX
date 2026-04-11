import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'
import { getCurrentUser } from '@/lib/auth'
import { validateObjectId } from '@/utils/validators'

export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 })
    }

    const post = await Post.findById(postId)

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    const user = await User.findById(currentUser._id)
    const currentPinnedId = user.pinnedPost

    if (currentPinnedId && currentPinnedId.toString() === postId) {
      user.pinnedPost = null
      await user.save()
      return NextResponse.json({ message: 'Post unpinned', isPinned: false })
    }

    user.pinnedPost = postId
    await user.save()

    return NextResponse.json({ message: 'Post pinned to profile', isPinned: true })
  } catch (error) {
    console.error('[PinPostPATCH] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}