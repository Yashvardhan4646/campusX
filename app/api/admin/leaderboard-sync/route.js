import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import User from '@/models/User';
import { getRedis, isRedisAvailable } from '@/lib/redis';

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!isRedisAvailable()) {
      return NextResponse.json({ message: 'Redis is not available' }, { status: 500 });
    }

    await connectDB();
    const redis = getRedis();

    // 1. Sync Global Leaderboard
    const topGlobalUsers = await User.find({ isDeleted: false, isBanned: false })
      .sort({ totalXP: -1 })
      .limit(500)
      .select('username name avatar college totalXP level isVerified verificationType')
      .lean();

    const globalKey = 'leaderboard:global';
    await redis.del(globalKey);
    
    for (const user of topGlobalUsers) {
      const member = JSON.stringify({
        id: user._id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        college: user.college,
        isVerified: user.isVerified,
        verificationType: user.verificationType
      });
      await redis.zadd(globalKey, { score: user.totalXP || 0, member });
    }

    // 2. Sync Weekly Leaderboard
    const topWeeklyUsers = await User.find({ isDeleted: false, isBanned: false, weeklyXP: { $gt: 0 } })
      .sort({ weeklyXP: -1 })
      .limit(500)
      .select('username name avatar college weeklyXP level isVerified verificationType')
      .lean();

    const weeklyKey = 'leaderboard:weekly';
    await redis.del(weeklyKey);
    
    for (const user of topWeeklyUsers) {
      const member = JSON.stringify({
        id: user._id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        college: user.college,
        isVerified: user.isVerified,
        verificationType: user.verificationType
      });
      await redis.zadd(weeklyKey, { score: user.weeklyXP || 0, member });
    }

    // 3. Sync College Leaderboards (Top 10 colleges)
    const colleges = await User.distinct('college', { college: { $ne: '' } });
    
    for (const college of colleges) {
      const collegeUsers = await User.find({ college, isDeleted: false, isBanned: false })
        .sort({ totalXP: -1 })
        .limit(100)
        .select('username name avatar college totalXP level isVerified verificationType')
        .lean();

      const collegeKey = `leaderboard:college:${college}`;
      await redis.del(collegeKey);
      
      for (const user of collegeUsers) {
        const member = JSON.stringify({
          id: user._id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          college: user.college,
          isVerified: user.isVerified,
          verificationType: user.verificationType
        });
        await redis.zadd(collegeKey, { score: user.totalXP || 0, member });
      }
    }

    return NextResponse.json({ 
      message: 'Leaderboards synced successfully',
      syncedCount: topGlobalUsers.length,
      collegesSynced: colleges.length
    });
  } catch (error) {
    console.error('Leaderboard sync error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
