import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';

import Post from '@/models/Post';

import User from '@/models/User';

import Community from '@/models/Community';

import { getCurrentUser } from '@/lib/auth';

import { sanitizeMongoInput, sanitizeUser } from '@/lib/sanitize';



export async function GET(request) {

  try {

    const currentUser = await getCurrentUser(request);

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page')) || 1;

    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);

    const community = sanitizeMongoInput(searchParams.get('community'));

    const username = sanitizeMongoInput(searchParams.get('username'));



    await connectDB();



    const query = { isDeleted: { $ne: true } };

    if (community) {

      const escapedCommunity = community.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      query.community = { $regex: new RegExp(`^${escapedCommunity}$`, 'i') };

    }



    if (username) {

      const user = await User.findOne({ username: username.toString() })

        .select('_id')

        .lean();

      if (user) {

        query.author = user._id;

      } else {

        return NextResponse.json({ posts: [], hasMore: false, total: 0 });

      }

    }



    const skip = (page - 1) * limit;

    let posts;
    let total;

    // Personalized/Randomized Feed Logic
    if (!community && !username && page === 1) {
      // 1. Get latest 15 posts
      const latestPosts = await Post.find(query)
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('author', 'name username avatar college')
        .lean();

      // 2. Get 15 random older posts (excluding the latest ones)
      const latestIds = latestPosts.map(p => p._id);
      const olderPosts = await Post.aggregate([
        { $match: { ...query, _id: { $nin: latestIds } } },
        { $sample: { size: 15 } },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
        { $unwind: '$author' },
        { $project: { 'author.password': 0, 'author.email': 0 } }
      ]);

      // 3. Merge and Shuffle
      posts = [...latestPosts, ...olderPosts]
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
      
      total = await Post.countDocuments(query);
    } else {
      // Regular paginated/filtered feed
      [posts, total] = await Promise.all([
        Post.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author', 'name username avatar college')
          .lean(),
        Post.countDocuments(query),
      ]);
    }



    // Fetch community details for all unique communities in the posts
    const communityNames = [...new Set(posts.map(p => p.community).filter(Boolean))];
    const communities = await Community.find({ 
      $or: [
        { name: { $in: communityNames } },
        { slug: { $in: communityNames.map(n => n.toLowerCase().replace(/\s+/g, '-')) } }
      ]
    }).select('name slug emoji').lean();

    const communityMap = communities.reduce((acc, c) => {
      acc[c.name.toLowerCase()] = c;
      acc[c.slug.toLowerCase()] = c;
      return acc;
    }, {});

    const postsWithReactions = posts.map(post => {
      const isLiked = currentUser ? post.likes?.some(id => id.toString() === currentUser._id.toString()) : false;
      const isBookmarked = currentUser && currentUser.bookmarks ? 
        currentUser.bookmarks.some(id => id.toString() === post._id.toString()) : false;
      
      // Get community details
      const communityInfo = post.community ? communityMap[post.community.toLowerCase()] : null;

      // Remove raw likes for privacy/payload size
      const { likes, author, ...postData } = post;
      
      return {
        ...postData,
        likesCount: post.likesCount ?? post.likes?.length ?? 0,
        shareCount: post.shareCount ?? 0,
        author: sanitizeUser(author),
        _isLiked: isLiked,
        _isBookmarked: isBookmarked,
        communityInfo: communityInfo ? {
          name: communityInfo.name,
          slug: communityInfo.slug,
          emoji: communityInfo.emoji
        } : null
      };
    });

    return NextResponse.json({
      posts: postsWithReactions,
      hasMore: skip + posts.length < total,
      page,
      total,
    });

  } catch (error) {

    console.error('Post fetching error:', error);

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });

  }

}

