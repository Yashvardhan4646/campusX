import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import PromoCode from "@/models/PromoCode";
import crypto from "crypto";

export async function GET(req) {
    try {
        await connectDB();
        const user = await getCurrentUser(req);

        if (!user?._id || !isAdmin(user)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const promoCodes = await PromoCode.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "username")
            .populate("usedBy.userId", "username");

        return NextResponse.json({ promoCodes }, { status: 200 });
    } catch (error) {
        console.error("Get promo codes error:", error);
        return NextResponse.json(
            { error: "Failed to get promo codes" },
            { status: 500 },
        );
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = await getCurrentUser(req);

        if (!user?._id || !isAdmin(user)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { durationDays, maxUses = 1, expiresAt } = await req.json();

        if (!durationDays || durationDays < 1) {
            return NextResponse.json(
                { error: "Invalid duration" },
                { status: 400 },
            );
        }

        // Generate random promo code
        const code = crypto.randomBytes(4).toString("hex").toUpperCase();

        const promoCode = new PromoCode({
            code,
            durationDays,
            maxUses,
            createdBy: user._id,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        await promoCode.save();
        const populatedCode = await PromoCode.findById(promoCode._id).populate(
            "createdBy",
            "username",
        );

        return NextResponse.json({ promoCode: populatedCode }, { status: 201 });
    } catch (error) {
        console.error("Create promo code error:", error);
        return NextResponse.json(
            { error: "Failed to create promo code" },
            { status: 500 },
        );
    }
}
