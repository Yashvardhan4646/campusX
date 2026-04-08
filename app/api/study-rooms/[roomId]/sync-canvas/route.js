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

    const body = await request.json();
    const { snapshot } = body;

    await connectDB();

    const room = await StudyRoom.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const userId = currentUser._id.toString();
    const isParticipant = room.participants.some(
      p => p.toString() === userId
    ) || room.creator.toString() === userId;

    if (!isParticipant) {
      return NextResponse.json({ error: 'Not a participant of this room' }, { status: 403 });
    }

    room.canvasSnapshot = snapshot;
    await room.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[StudyRoom SYNC-CANVAS]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to sync canvas' }, { status: 500 });
  }
}
