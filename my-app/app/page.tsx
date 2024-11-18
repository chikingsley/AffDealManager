import { Metadata } from "next"
import { DealManagementTabs } from "@/components/deal-management/deal-management-tabs"

export const metadata: Metadata = {
  title: "Deal Management",
  description: "Comprehensive deal management interface for tracking and managing affiliate marketing deals.",
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex-1">
        <DealManagementTabs />
      </div>
    </main>
  )
}
