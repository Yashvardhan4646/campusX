import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
    const markdown = `# CampusZen Project Overview

## Key Information
- **Project Name:** CampusZen
- **Tagline:** India's exclusive social network for college students.
- **Mission:** To provide a safe, student-only space for networking, resource sharing, and collaboration.
- **Target Audience:** Indian college students (IITs, NITs, and other recognized institutions).

## Technical Specifications
- **Architecture:** Next.js (App Router) with SSR and ISR.
- **Frontend:** React, Tailwind CSS, Framer Motion, GSAP for animations.
- **Backend:** Next.js API Routes, Node.js.
- **Database:** MongoDB (via Mongoose) for persistent data, Redis for caching and rate limiting.
- **Real-time:** Pusher for instant messaging and live updates.
- **Storage:** Cloudinary and UploadThing for media/resource files.
- **Authentication:** Custom JWT-based authentication with student email verification.

## Content Structure
- **Feed:** Real-time updates and posts from verified students.
- **Communities:** Department-specific and interest-based groups.
- **Resources:** Peer-to-peer sharing of notes, PYQs, and study materials.
- **Code Area:** Collaborative live code editor for group study and prep.
- **Events:** Campus-specific and regional student events.

## API Documentation
- Internal APIs follow RESTful principles.
- Endpoints for posts, comments, resources, and user management.
- Real-time events handled via Pusher channels.

## Update Frequency
- Weekly feature updates and bug fixes.
- Continuous content moderation by student ambassadors.

## Contact & Support
- **Support Email:** usersynax@gmail.com
- **Developer:** Built by students for students.

## Keywords
student social network, college community, IIT, NIT, campus networking, student resources, collaborative coding, India.
`;

    return new NextResponse(markdown, {
        headers: {
            "Content-Type": "text/markdown; charset=utf-8",
        },
    });
}
