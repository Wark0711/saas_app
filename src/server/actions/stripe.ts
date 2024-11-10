'use server'

import { PaidTierNames, subscriptionTiers } from "@/data/subscriptionTiers";
import { User, auth, currentUser } from "@clerk/nextjs/server";
import { getUserSubscription } from "../db/subscritpion";
import { env as serverEnv } from "@/data/env/server";
import { env as clientEnv } from "@/data/env/clients";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY)

export async function createCancelSession() {
    const user = await currentUser()
    if (user == null) {
        console.log({ error: true, message: 'No valid user' });
        return
    }

    const subscription = await getUserSubscription(user.id)
    if (subscription == null) {
        console.log({ error: true, message: 'No valid user subscription' });
        return
    }

    if (subscription.stripeCustomerId == null || subscription.stripeSubscriptionId == null) {
        console.log({ error: true, message: 'No valid stripe customer details' });
        return
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subsrciption`,
        flow_data: {
            type: 'subscription_cancel',
            subscription_cancel: {
                subscription: subscription.stripeSubscriptionId
            }
        }
    })

    redirect(portalSession.url)
}

export async function createCustomerPortalSession() {
    const { userId } = await auth()
    if (userId == null) {
        console.log({ error: true, message: 'No user id' });
        return
    }

    const subscription = await getUserSubscription(userId)
    if (subscription?.stripeCustomerId == null) {
        console.log({ error: true, message: 'No stripe details in user subscription' });
        return
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subsrciption`
    })

    redirect(portalSession.url)
}

export async function createCheckoutSession(tier: PaidTierNames) {
    const user = await currentUser()
    if (user == null) {
        console.log({ error: true, message: 'No user id' });
        return
    }

    const subscription = await getUserSubscription(user.id)
    if (subscription == null) {
        console.log({ error: true, message: 'No details in user subscription' });
        return
    }

    if (subscription?.stripeCustomerId == null) {
        const url = await getCheckoutSession(tier, user)
        if (url == null) {
            console.log({ error: true, message: 'Falied to create checkout URL in stripe' });
            return
        }

        redirect(url)
    }
    else {
        const url = await getSubscriptionUpgradeSession(tier, subscription)
        redirect(url)
    }
}

async function getCheckoutSession(tier: PaidTierNames, user: User) {
    const session = await stripe.checkout.sessions.create({
        customer_email: user?.primaryEmailAddress?.emailAddress,
        subscription_data: {
            metadata: {
                clerkUserId: user.id
            }
        },
        line_items: [
            {
                price: subscriptionTiers[tier].stripePriceId,
                quantity: 1
            }
        ],
        mode: 'subscription',
        success_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
        cancel_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
    })

    return session.url
}

async function getSubscriptionUpgradeSession(tier: PaidTierNames, subscription: {
    stripeCustomerId: string | null,
    stripeSubscriptionId: string | null,
    stripeSubscriptionItemId: string | null
}) {
    if (subscription.stripeCustomerId == null || subscription.stripeSubscriptionId == null || subscription.stripeSubscriptionItemId == null) throw new Error('')
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subsrciption`,
        flow_data: {
            type: 'subscription_update_confirm',
            subscription_update_confirm: {
                subscription: subscription.stripeSubscriptionId,
                items: [
                    {
                        id: subscription.stripeSubscriptionItemId,
                        price: subscriptionTiers[tier].stripePriceId,
                        quantity: 1
                    }
                ]
            }
        }
    })

    return portalSession.url
}