import { useForm } from "react-hook-form"

export function CountryDiscountsForm({ productId, countryGroups }: {
    productId: string,
    countryGroups: {
        id: string
        name: string
        recommendedDiscountPercentage: number | null
        countries: {
            name: string
            code: string
        }[]
        discount?: {
            coupon: string
            discountPercentage: number
        }
    }[]
}) {

    // const form = useForm()

    return (
        <></>
    )
}