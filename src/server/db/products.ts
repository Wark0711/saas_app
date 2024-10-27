import { db } from "@/drizzle/db";

export async function getProducts(userId: string, { limit }: { limit?: number }) {
    return db.query.ProductTable.findMany({
        where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
        orderBy: (({ createdAt }, { desc }) => desc(createdAt)),
        limit
    })
}