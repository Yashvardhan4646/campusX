"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, CreditCard, Gift } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, isAfter } from "date-fns";

export default function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [promoCode, setPromoCode] = useState("");
    const [redeeming, setRedeeming] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/billing/subscription");
            const data = await res.json();
            setSubscription(data.subscription);
        } catch (error) {
            console.error("Failed to fetch subscription:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!promoCode.trim()) return;

        try {
            setRedeeming(true);
            const res = await fetch("/api/billing/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: promoCode.trim() }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to redeem code");

            toast.success("Promo code redeemed successfully!");
            setPromoCode("");
            fetchSubscription();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setRedeeming(false);
        }
    };

    const isSubActive =
        subscription &&
        subscription.isActive &&
        isAfter(new Date(subscription.endsAt), new Date());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight">
                    Billing & Subscription
                </h1>
                <p className="text-muted-foreground text-sm">
                    Manage your subscription and redeem promo codes
                </p>
            </div>

            {/* Current Subscription */}
            <Card className="bg-accent/30 border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Current Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isSubActive ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="font-bold">
                                    Active Subscription
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Expires{" "}
                                {formatDistanceToNow(
                                    new Date(subscription.endsAt),
                                    { addSuffix: true },
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <XCircle className="w-5 h-5" />
                                <span className="font-medium">
                                    No active subscription
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Redeem a promo code below to activate
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Redeem Promo Code */}
            <Card className="bg-accent/20 border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Redeem Promo Code
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRedeem} className="flex gap-2">
                        <Input
                            placeholder="Enter promo code..."
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            disabled={redeeming}
                            className="bg-background"
                        />
                        <Button
                            type="submit"
                            disabled={redeeming || !promoCode.trim()}
                        >
                            {redeeming ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Redeem"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
