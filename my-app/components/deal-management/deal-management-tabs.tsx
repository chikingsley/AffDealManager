"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, FileText, DollarSign, Briefcase, Plus, Users } from 'lucide-react'
import { DashboardTab } from "./dashboard/dashboard-tab"
import { DealsTab } from "./deals/deals-tab"
import { OffersTab } from "./offers/offers-tab"
import { FinanceTab } from "./finance/finance-tab"
import { LeadsTab } from "./leads/leads-tab"

export function DealManagementTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "dashboard")

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  // Initialize tab from URL on mount
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl && ["dashboard", "deals", "offers", "finance", "leads"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Deal Management</h1>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Offers
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="deals">
          <DealsTab />
        </TabsContent>

        <TabsContent value="offers">
          <OffersTab />
        </TabsContent>

        <TabsContent value="finance">
          <FinanceTab />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
