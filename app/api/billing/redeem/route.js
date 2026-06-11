import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import PromoCode from '@/models/PromoCode';
import Subscription from '@/models/Subscription';
import User from '@/models/User';

export async function POST(req) {
    try {
        await connectDB();
        const user = await getCurrentUser(req);
        
        if (!user?._id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        const promoCode = await PromoCode.findOne({ 
            code: code.toUpperCase().trim(), 
            isActive: true 
        });

        if (!promoCode) {
            return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 });
        }

        if (promoCode.useCount >= promoCode.maxUses) {
            return NextResponse.json({ error: 'This promo code has reached its maximum uses' }, { status: 400 });
        }

        if (promoCode.usedBy.some(u => u.userId.toString() === user._id.toString())) {
            return NextResponse.json({ error: 'You have already used this promo code' }, { status: 400 });
        }

        if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
            return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 });
        }

        // Find or create subscription
        let subscription = await Subscription.findOne({ userId: user._id });
        const now = new Date();
        const startDate = subscription && subscription.isActive && subscription.endsAt > now 
            ? new Date(subscription.endsAt) 
            : now;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + promoCode.durationDays);

        if (!subscription) {
            subscription = new Subscription({
                userId: user._id,
                startsAt: startDate,
                endsAt: endDate,
                promoCodeId: promoCode._id
            });
        } else {
            subscription.startsAt = startDate;
            subscription.endsAt = endDate;
            subscription.isActive = true;
            subscription.promoCodeId = promoCode._id;
        }

        await subscription.save();

        // Set user's isPro to true
        await User.findByIdAndUpdate(user._id, { isPro: true });

        // Update promo code usage
        promoCode.useCount += 1;
        promoCode.usedBy.push({
            userId: user._id,
            usedAt: now
        });
        await promoCode.save();

        return NextResponse.json({ 
            success: true, 
            subscription: {
                startsAt: subscription.startsAt,
                endsAt: subscription.endsAt
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Redeem promo code error:', error);
        return NextResponse.json({ error: 'Failed to redeem promo code' }, { status: 500 });
    }
}
