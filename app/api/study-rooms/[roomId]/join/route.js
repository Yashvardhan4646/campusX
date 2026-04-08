import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import StudyRoom from '@/models/StudyRoom';
import { validateObjectId } from '@/utils/validators';

export async function POST(request, { params }) {
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

    const userId = currentUser._id.toString();
    const isParticipant = room.participants.some(
      p => p.toString() === userId
    );

    if (!isParticipant) {
      room.participants.push(currentUser._id);
      await room.save();
    }

    await room.populate('creator', 'name avatar username');
    await room.populate('participants', 'name avatar username');

    return NextResponse.json({ room });
  } catch (error) {
    console.error('[StudyRoom JOIN]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
