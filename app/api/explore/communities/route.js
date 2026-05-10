import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Community from '@/models/Community';
import Post from '@/models/Post';
import User from '@/models/User';
import { withCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await withCache(`explore_communities_${currentUser.id}`, 300, async () => {
      await connectDB();

      // Get current user's profile for personalization
      const userProfile = await User.findById(currentUser.id)
        .select('college course interests')
        .lean();

      if (!userProfile) {
        return { communities: [] };
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Get all communities with activity data
      const communitiesWithActivity = await Community.aggregate([
        {
          $lookup: {
            from: 'posts',
            localField: 'name',
            foreignField: 'community',
            as: 'recentPosts',
            pipeline: [
              {
                $match: {
                  createdAt: { $gte: sevenDaysAgo },
                  isDeleted: false,
                  isHidden: false
                }
              },
              { $count: 'count' }
            ]
          }
        },
        {
          $addFields: {
            recentPostCount: { $arrayElemAt: ['$recentPosts.count', 0] },
            totalMembers: { $size: { $ifNull: ['$members', []] } }
          }
        },
        {
          $addFields: {
            // College-specific community score
            collegeScore: {
              $cond: [
                { $eq: ['$name', userProfile.college] },
                userProfile.college ? 40 : 0,
                0
              ]
            },
            // Interest alignment score (check if community name matches interests)
            interestScore: {
              $add: [
                {
                  $cond: [
                    {
                      $in: [
                        { $toLower: '$name' },
                        { $map: { input: userProfile.interests || [], as: 'interest', in: { $toLower: '$$interest' } } }
                      ]
                    },
                    30,
                    0
                  ]
                }
              ]
            },
            // High activity score
            activityScore: {
              $cond: [
                { $gte: ['$recentPostCount', 5] },
                20,
                { $cond: [{ $gte: ['$recentPostCount', 2] }, 10, 0] }
              ]
            },
            // Growing community score
            growthScore: {
              $cond: [
                { $gte: ['$totalMembers', 50] },
                10,
                0
              ]
            }
          }
        },
        {
          $addFields: {
            totalScore: {
              $add: [
                '$collegeScore',
                '$interestScore',
                '$activityScore',
                '$growthScore'
              ]
            }
          }
        },
        { $sort: { totalScore: -1, recentPostCount: -1 } },
        { $limit: 15 },
        {
          $project: {
            name: 1,
            slug: 1,
            totalMembers: 1,
            recentPostCount: 1,
            totalScore: 1,
            createdAt: 1
          }
        }
      ]);

      return { communities: communitiesWithActivity };
    });

    const response = NextResponse.json(data);

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Explore communities error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
