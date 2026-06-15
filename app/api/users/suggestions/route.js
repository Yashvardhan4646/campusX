import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeUser } from '@/lib/sanitize';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 5;

    const query = currentUser
      ? { _id: { $ne: currentUser._id } }
      : {};

    const suggestions = await User.find(query)
      .sort({ createdAt: -1 }) // Latest users first
      .limit(limit)
      .select("name username avatar college")
      .lean();

    const sanitizedSuggestions = suggestions.map((user) =>
      sanitizeUser(user)
    );

    return NextResponse.json(sanitizedSuggestions);
  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}