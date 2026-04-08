import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import StudyRoom from '@/models/StudyRoom';
import { validateObjectId } from '@/utils/validators';

export async function GET(request, { params }) {
  const { roomId } = await params;
  try {
    if (!validateObjectId(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }

    await connectDB();

    const room = await StudyRoom.findById(roomId)
      .populate('creator', 'name avatar username')
      .populate('participants', 'name avatar username')
      .lean();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('[StudyRoom GET]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { roomId } = await params;
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!validateObjectId(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }

    await connectDB();

    const room = await StudyRoom.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.creator.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Only the creator can delete this room' }, { status: 403 });
    }

    await StudyRoom.findByIdAndDelete(roomId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[StudyRoom DELETE]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
