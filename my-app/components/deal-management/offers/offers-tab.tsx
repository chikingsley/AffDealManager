import { OffersDataTable } from "@/components/offers/offers-data-table"

export function OffersTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Offers</h2>
        <p className="text-muted-foreground">
          Here&apos;s a list of all your offers from Notion
        </p>
      </div>
      <OffersDataTable />
    </div>
  )
}
