"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import useUser from "@/hooks/useUser";
import { toast } from "sonner";

export default function NotificationPreferences() {
    const { user } = useUser();
    const {
        isSupported,
        permission,
        subscription,
        loading: pushLoading,
        requestPermissionAndSubscribe,
        unsubscribe
    } = usePushNotifications();

    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        dm: true,
        groups: true,
        mentions: true,
        sound: true,
        vibrate: true
    });

    const handleToggleNotifications = async () => {
        if (subscription) {
            try {
                setSaving(true);
                await unsubscribe();
                toast.success("Notifications disabled");
            } catch {
                toast.error("Failed to disable notifications");
            } finally {
                setSaving(false);
            }
        } else {
            try {
                setSaving(true);
                await requestPermissionAndSubscribe();
                toast.success("Notifications enabled");
            } catch {
                toast.error("Failed to enable notifications");
            } finally {
                setSaving(false);
            }
        }
    };

    if (!isSupported) {
        return (
            <div className="p-4 rounded-lg border border-border bg-accent/30">
            <div className="flex items-center gap-2 mb-2">
                <BellOff className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Push Notifications Not Supported</h3>
            </div>
            <p className="text-sm text-muted-foreground">
                Your browser does not support push notifications.
            </p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-accent/30">
                <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" />
                    <div>
                        <h3 className="font-semibold">Push Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                            {subscription ? "You will receive notifications when the app is closed" : "Enable to get notifications"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {permission === 'granted' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : permission === 'denied' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                    ) : null}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleNotifications}
                        disabled={saving || pushLoading}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : null}
                        {subscription ? "Disable" : "Enable"}
                    </Button>
                </div>
            </div>

            {subscription && (
                <div className="space-y-4 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dm-notifications">Direct Messages</Label>
                        <Switch
                            id="dm-notifications"
                            checked={preferences.dm}
                            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, dm: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="groups-notifications">Group Messages</Label>
                        <Switch
                            id="groups-notifications"
                            checked={preferences.groups}
                            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, groups: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="mentions-notifications">Mentions</Label>
                        <Switch
                            id="mentions-notifications"
                            checked={preferences.mentions}
                            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, mentions: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="sound-notifications">Notification Sounds</Label>
                        <Switch
                            id="sound-notifications"
                            checked={preferences.sound}
                            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, sound: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="vibrate-notifications">Vibration</Label>
                        <Switch
                            id="vibrate-notifications"
                            checked={preferences.vibrate}
                            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, vibrate: checked })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
