import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { env } from '@/data/env/server'
import { createUserSubscritpion, deleteUser, getUserSubscription } from '@/server/db/subscritpion'
import Stripe from 'stripe'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function POST(req: Request) {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
    const headerPayload = headers()
    const svixId = headerPayload.get("svix-id")
    const svixTimestamp = headerPayload.get("svix-timestamp")
    const svixSignature = headerPayload.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response("Error occurred -- no svix headers", {
            status: 400,
        })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET)

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        }) as WebhookEvent
    }
    catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
            status: 400,
        })
    }

    switch (evt?.type) {
        case "user.created": {
            await createUserSubscritpion({
                clerkUserId: evt.data.id,
                tier: "Free"
            })
            break
        }
        case "user.deleted": {
            if (evt.data.id != null) {
                const userSubscription = await getUserSubscription(evt.data.id)
                if (userSubscription?.stripeSubscriptionId != null) {
                    await stripe.subscriptions.cancel(userSubscription?.stripeSubscriptionId)
                }
                await deleteUser(evt.data.id)
            }
        }
    }

    return new Response('', { status: 200 })
}