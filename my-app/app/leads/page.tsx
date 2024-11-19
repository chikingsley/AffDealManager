import { Metadata } from "next"
import { LeadsTable } from "@/components/leads/LeadsTable"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export const metadata: Metadata = {
  title: "Leads",
  description: "Manage and track all your leads, import CSV data, and monitor call status updates.",
}

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all your leads, import CSV data, and monitor call status updates.
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </div>
      
      <LeadsTable />
    </div>
  )
}
