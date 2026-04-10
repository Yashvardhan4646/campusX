import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withCache } from '@/lib/cache';
import Community from '@/models/Community';
import { sanitizeMongoInput } from '@/lib/sanitize';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const specificName = sanitizeMongoInput(searchParams.get('name'));
    const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 50);

    await connectDB();

    // Specific community stats
    if (specificName) {
      const community = await Community.findOne({
        name: { $regex: new RegExp(`^${specificName}$`, 'i') }
      })
      if (!community) {
        return NextResponse.json({ name: specificName, postCount: 0, memberCount: 0 })
      }
      return NextResponse.json({
        name: community.name,
        slug: community.slug,
        postCount: community.postCount,
        memberCount: community.members.length
      })
    }

    // All communities
    const communities = await withCache('communities_list', 60, async () => {
      const list = await Community.find()
        .sort({ postCount: -1 })
        .limit(limit)
        .lean()

      return list.map(c => ({
        name: c.name,
        slug: c.slug,
        postCount: c.postCount,
        memberCount: c.members.length,
        lastPost: c.updatedAt
      }))
    })

    return NextResponse.json(communities)
  } catch (error) {
    console.error('Communities API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}