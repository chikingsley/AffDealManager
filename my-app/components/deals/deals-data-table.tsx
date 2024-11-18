"use client"

import { DealsTable } from "@/components/deals/deals-table"
import { columns } from "@/components/deals/columns"
import { useDeals } from "@/hooks/use-deals"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DealsDataTable() {
  const { deals, loading, error } = useDeals()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          {error.includes("token") || error.includes("database") ? (
            <p className="mt-2 text-sm">
              Please check your Notion credentials in the .env file.
            </p>
          ) : null}
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-[450px] w-full" />
      </div>
    )
  }

  return <DealsTable data={deals} columns={columns} />
}
