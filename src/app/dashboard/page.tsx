import { getProducts } from "@/server/db/products"
import { auth } from "@clerk/nextjs/server"
import { NoProductsPage } from "./_components/NoProducts"
import Link from "next/link"
import { ArrowRightIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "./_components/ProductGrid"

export default async function DashboardPage() {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()

    const products = await getProducts(userId, { limit: 5 })
    if (products.length == 0) return <NoProductsPage />

    return (
        <>
            <h2 className="mb-6 text-3xl font-semibold flex justify-between">
                <Link className="group flex gap-2 items-center hover:underline" href={'/dashboard/products'}>
                    Products
                    <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Button asChild>
                    <Link href={'/dashboard/products/new'}>
                        <PlusIcon className="size-4" />
                        New Product
                    </Link>
                </Button>
            </h2>
            <ProductGrid products={products} />
        </>
    )
}