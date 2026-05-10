import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getLeaderboard } from '@/lib/gamification';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global'; // global, weekly, college
    const limit = parseInt(searchParams.get('limit')) || 20;

    await connectDB();
    const currentUser = await getCurrentUser(request);

    let college = null;
    if (type === 'college') {
      if (!currentUser || !currentUser.college) {
        return NextResponse.json({ message: 'College information not found' }, { status: 400 });
      }
      college = currentUser.college;
    }

    const leaderboard = await getLeaderboard(type, college, limit);

    return NextResponse.json({
      leaderboard,
      type,
      college
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
