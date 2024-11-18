import { DealsDataTable } from "@/components/deals/deals-data-table"

export function DealsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Deals</h2>
        <p className="text-muted-foreground">
          Here&apos;s a list of all your deals from Notion
        </p>
      </div>
      <DealsDataTable />
    </div>
  )
}
