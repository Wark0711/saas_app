import { HasPermission } from "@/components/HasPermission"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CHART_INTERVALS, getViewsByCountryChartData, getViewsByPPPChartData } from "@/server/db/productViews"
import { canAccessAnalytics } from "@/server/permissions"
import { auth } from "@clerk/nextjs/server"
import { ViewsByCountryChart } from "../_components/charts/ViewsByCountryChart"
import { ViewsByPPPChart } from "../_components/charts/ViewsByPPPChart"

export default async function AnalyticsPage({ searchParams }: {
    searchParams: {
        interval?: string,
        timeZone?: string,
        productId?: string
    }
}) {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()

    const timeZone = searchParams.timeZone || 'UTC'
    const productId = searchParams.productId
    const interval = CHART_INTERVALS[searchParams.interval as keyof typeof CHART_INTERVALS] ?? CHART_INTERVALS.last7Days

    return (
        <>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <HasPermission permission={canAccessAnalytics} renderFallback>
                <div className="flex flex-col gap-8">
                    {/* <ViewsByDayCard interval={interval} timeZone={timeZone} userId={userId} productId={productId} /> */}
                    <ViewsByPPPCard interval={interval} timeZone={timeZone} userId={userId} productId={productId} />
                    <ViewsByCountryCard interval={interval} timeZone={timeZone} userId={userId} productId={productId} />
                </div>
            </HasPermission>
        </>
    )
}

// async function ViewsByDayCard(props: Parameters<typeof getViewsByDayChartData>[0]) {
//     const chartData = await getViewsByDayChartData(props)

//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Visitors Per Day</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <ViewsByDayChart chartData={chartData} />
//             </CardContent>
//         </Card>
//     )
// }

async function ViewsByPPPCard(props: Parameters<typeof getViewsByPPPChartData>[0]) {
    const chartData = await getViewsByPPPChartData(props)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Visitors Per PPP Group</CardTitle>
            </CardHeader>
            <CardContent>
                <ViewsByPPPChart chartData={chartData} />
            </CardContent>
        </Card>
    )
}

async function ViewsByCountryCard(props: Parameters<typeof getViewsByCountryChartData>[0]) {
    const chartData = await getViewsByCountryChartData(props)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Visitors Per Country</CardTitle>
            </CardHeader>
            <CardContent>
                <ViewsByCountryChart chartData={chartData} />
            </CardContent>
        </Card>
    )
}