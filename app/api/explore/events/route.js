import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import User from '@/models/User';
import { withCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await withCache(`explore_events_${currentUser.id}`, 300, async () => {
      await connectDB();

      // Get current user's profile for personalization
      const userProfile = await User.findById(currentUser.id)
        .select('college course interests')
        .lean();

      if (!userProfile) {
        return { events: [] };
      }

      const now = new Date();
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Build recommendation pipeline
      const pipeline = [
        // Filter for upcoming events
        {
          $match: {
            eventDate: { $gte: now, $lte: thirtyDaysFromNow },
            isActive: true
          }
        },

        // Populate organizer data
        {
          $lookup: {
            from: 'users',
            localField: 'organizer',
            foreignField: '_id',
            as: 'organizer',
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1,
                  avatar: 1,
                  college: 1
                }
              }
            ]
          }
        },
        { $unwind: '$organizer' },

        // Add scoring fields
        {
          $addFields: {
            // Same college score
            collegeScore: {
              $cond: [
                { $eq: ['$college', userProfile.college] },
                userProfile.college ? 40 : 0,
                0
              ]
            },
            // Interest match score (based on tags)
            interestScore: {
              $multiply: [
                {
                  $size: {
                    $setIntersection: [
                      userProfile.interests || [],
                      { $map: { input: '$tags', as: 'tag', in: { $toLower: '$$tag' } } }
                    ]
                  }
                },
                30
              ]
            },
            // Coming soon score (events in next 7 days)
            comingSoonScore: {
              $cond: [
                { $lte: ['$eventDate', sevenDaysFromNow] },
                20,
                0
              ]
            },
            // High RSVP score (social proof)
            rsvpScore: {
              $cond: [
                { $gte: [{ $size: { $ifNull: ['$rsvps', []] } }, 10] },
                15,
                { $cond: [{ $gte: [{ $size: { $ifNull: ['$rsvps', []] } }, 5] }, 8, 0] }
              ]
            },
            // Available spots score
            availabilityScore: {
              $cond: [
                { $eq: ['$capacity', 0] },
                5, // Unlimited capacity
                {
                  $cond: [
                    { $gt: [{ $subtract: ['$capacity', { $size: { $ifNull: ['$rsvps', []] } }] }, 0] },
                    5, // Still has spots
                    0 // Full
                  ]
                }
              ]
            }
          }
        },

        // Calculate total score
        {
          $addFields: {
            totalScore: {
              $add: [
                '$collegeScore',
                '$interestScore',
                '$comingSoonScore',
                '$rsvpScore',
                '$availabilityScore'
              ]
            }
          }
        },

        // Sort by score and then by event date
        { $sort: { totalScore: -1, eventDate: 1 } },

        // Limit to top recommendations
        { $limit: 15 },

        // Add virtual fields and project needed data
        {
          $addFields: {
            rsvpCount: { $size: { $ifNull: ['$rsvps', []] } },
            isFull: {
              $cond: [
                { $eq: ['$capacity', 0] },
                false,
                { $gte: [{ $size: { $ifNull: ['$rsvps', []] } }, '$capacity'] }
              ]
            },
            isPast: { $lt: ['$eventDate', now] },
            isUserRSVPed: { $in: [currentUser.id, '$rsvps'] }
          }
        },

        {
          $project: {
            title: 1,
            description: 1,
            college: 1,
            location: 1,
            eventDate: 1,
            capacity: 1,
            tags: 1,
            coverImage: 1,
            organizer: 1,
            rsvpCount: 1,
            isFull: 1,
            isPast: 1,
            isUserRSVPed: 1,
            totalScore: 1,
            createdAt: 1
          }
        }
      ];

      const events = await Event.aggregate(pipeline);

      return { events };
    });

    const response = NextResponse.json(data);

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Explore events error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
