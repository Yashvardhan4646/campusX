import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import StudyRoom from '@/models/StudyRoom';
import { validateObjectId } from '@/utils/validators';

export async function GET(request) {
  try {
    await connectDB();

    await StudyRoom.deleteMany({ expiresAt: { $lt: new Date() } });

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const currentUser = await getCurrentUser(request);

    let query = { isPublic: true };

    if (filter === 'my_college' && currentUser?.college) {
      query.college = currentUser.college;
    }

    if (filter === 'my_rooms' && currentUser) {
      query.creator = currentUser._id;
    }

    const rooms = await StudyRoom.find(query)
      .populate('creator', 'name avatar username')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('[StudyRooms GET]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, subject, isPublic } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    await connectDB();

    const room = await StudyRoom.create({
      name: name.trim(),
      subject: subject?.trim() || '',
      creator: currentUser._id,
      college: currentUser.college || '',
      isPublic: isPublic !== false,
      participants: [currentUser._id],
    });

    await room.populate('creator', 'name avatar username');

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('[StudyRooms POST]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
