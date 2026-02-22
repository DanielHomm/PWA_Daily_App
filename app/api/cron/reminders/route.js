import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:example@yourdomain.org",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function GET(req) {
    // Security check for cron secret if using Vercel Cron
    // Only enforce this in production so you can easily test locally
    if (process.env.NODE_ENV === 'production' && req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Wait, for this to work with the anon key, RLS must allow selecting from push_subscriptions and sub_challenges.
        // It's highly recommended to use the service role key for cron jobs. If they are marked "legacy",
        // the modern equivalent in Supabase might be different or they are just moving it in the UI. 
        // Let's use the anon key but warn the user that if RLS blocks read access it won't work,
        // or they can still use the legacy service_role key.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Get all sub-challenges where reminders_active is true
        const { data: subChallenges, error: subError } = await supabaseAdmin
            .from("sub_challenges")
            .select(`
        id, 
        title, 
        challenge_id, 
        challenges(name)
      `)
            .eq("reminders_active", true);

        if (subError) throw subError;

        // For each sub_challenge, we need to find members of that challenge and their push subscriptions
        let sentCount = 0;

        // In a real app we would calculate exactly when the 4 hours before renewal is.
        // For this example, we'll assume the cron is triggered exactly 4h before renewal for daily challenges.

        for (const sc of subChallenges) {
            // Get challenge members
            const { data: members, error: memError } = await supabaseAdmin
                .from("challenge_members")
                .select("user_id")
                .eq("challenge_id", sc.challenge_id);

            if (memError || !members) continue;

            const userIds = members.map(m => m.user_id);

            // Get push subscriptions for these users
            const { data: subscriptions, error: subscError } = await supabaseAdmin
                .from("push_subscriptions")
                .select("*")
                .in("user_id", userIds);

            if (subscError || !subscriptions) continue;

            // Send push notification to each subscription
            const payload = JSON.stringify({
                title: "Challenge Reminder!",
                body: `Your task "${sc.title}" in "${sc.challenges.name}" renews in 4 hours!`,
                url: `/challenges/${sc.challenge_id}`
            });

            for (const sub of subscriptions) {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                try {
                    await webpush.sendNotification(pushSubscription, payload);
                    sentCount++;
                } catch (error) {
                    console.error("Error sending push notification:", error);
                    // If the subscription is gone/invalid, we should delete it
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, sentCount });
    } catch (error) {
        console.error("Cron API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
