import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, DollarSign, Phone, Plus } from "lucide-react"
import { EmailValidator } from "./email-validator"

export function DashboardTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Quick Actions */}
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-primary/10 rounded-lg flex flex-col items-center gap-2 hover:bg-primary/20 transition-colors">
              <Plus className="h-6 w-6" />
              New Deal
            </button>
            <EmailValidator />
            <button className="p-4 bg-primary/10 rounded-lg flex flex-col items-center gap-2 hover:bg-primary/20 transition-colors">
              <Phone className="h-6 w-6" />
              Call Status
            </button>
            <button className="p-4 bg-primary/10 rounded-lg flex flex-col items-center gap-2 hover:bg-primary/20 transition-colors">
              <DollarSign className="h-6 w-6" />
              New Payment
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <Card className="lg:col-span-2">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            [Revenue/Balance Chart Placeholder]
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Active Tasks</h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg flex items-center justify-between">
              <span className="text-sm">5 invalids to verify</span>
              <button className="text-xs bg-yellow-500/20 px-2 py-1 rounded">Check</button>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg flex items-center justify-between">
              <span className="text-sm">3 calls to follow up</span>
              <button className="text-xs bg-blue-500/20 px-2 py-1 rounded">Review</button>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg flex items-center justify-between">
              <span className="text-sm">2 new payments</span>
              <button className="text-xs bg-green-500/20 px-2 py-1 rounded">Process</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
