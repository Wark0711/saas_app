'use server'

import { productCountryDiscountSchema, productDetailsSchema } from "@/schemas/products";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createProduct as createProductDb, deleteProduct as deleteProductDb, updateProduct as updateProductDb, updateCountryDiscounts as updateCountryDiscountsDb } from "@/server/db/products";
import { redirect } from "next/navigation";

export async function createProduct(unsafeData: z.infer<typeof productDetailsSchema>): Promise<{ error: boolean, message: string } | undefined> {
    const { userId } = await auth()
    const { success, data } = productDetailsSchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { error: true, message: 'There was an error creating your product' }
    }

    const { id } = await createProductDb({ ...data, clerkUserId: userId })
    redirect(`/dashboard/products/${id}/edit?tab=countries`)
}

export async function updateProduct(id: string, unsafeData: z.infer<typeof productDetailsSchema>): Promise<{ error: boolean, message: string } | undefined> {
    const { userId } = await auth()
    const { success, data } = productDetailsSchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { error: true, message: 'There was an error updating your product' }
    }

    const isSuccess = await updateProductDb(data, { id, userId })
    return { error: !isSuccess, message: isSuccess ? 'Product details updated' : 'There was an error updating your product' }
}

export async function deleteProduct(id: string) {
    const { userId } = await auth()
    if (userId == null) {
        return { error: true, message: 'There was an error deleting your product' }
    }

    const isSuccess = await deleteProductDb(id, userId)
    return { error: !isSuccess, message: isSuccess ? 'Successfully deleted your product' : 'There was an error deleting your product' }
}

export async function updateCountryDiscounts(id: string, unsafeData: z.infer<typeof productCountryDiscountSchema>) {
    const { userId } = await auth()
    const { success, data } = productCountryDiscountSchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { error: true, message: "There was an error saving your country discounts" }
    }

    const insert: {
        countryGroupId: string
        productId: string
        coupon: string
        discountPercentage: number
    }[] = []
    const deleteIds: { countryGroupId: string }[] = []

    data.groups.forEach(group => {
        if (
            group.coupon != null &&
            group.coupon.length > 0 &&
            group.discountPercentage != null &&
            group.discountPercentage > 0
        ) {
            insert.push({
                countryGroupId: group.countryGroupId,
                coupon: group.coupon,
                discountPercentage: group.discountPercentage / 100,
                productId: id,
            })
        } else {
            deleteIds.push({ countryGroupId: group.countryGroupId })
        }
    })

    await updateCountryDiscountsDb(deleteIds, insert, { productId: id, userId })

    return { error: false, message: "Country discounts saved" }
}