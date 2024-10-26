import { db } from "@/drizzle/db";
import { ProductTable, UserSubscriptionTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export function createUserSubscritpion(data: typeof UserSubscriptionTable.$inferInsert) {
    return db.insert(UserSubscriptionTable).values(data).onConflictDoNothing({
        target: UserSubscriptionTable.clerkUserId
    })
}

export function deleteUser(clerkUserId: string) {
    return db.batch([
        db.delete(UserSubscriptionTable)
            .where(eq(UserSubscriptionTable.clerkUserId, clerkUserId)),
        db.delete(ProductTable).where(eq(ProductTable.clerkUserId, clerkUserId))
    ])
}