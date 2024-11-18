import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WeekOption } from "@/types/finance"

interface HeaderProps {
  selectedWeek: string
  setSelectedWeek: (week: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  weekOptions: WeekOption[]
}

export function Header({
  selectedWeek,
  setSelectedWeek,
  searchTerm,
  setSearchTerm,
  weekOptions,
}: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Finance Overview</h2>
        <p className="text-sm text-muted-foreground">
          Track payments, invalids, and balances
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            {weekOptions.map(week => (
              <SelectItem key={week.value} value={week.value}>
                <div className="flex justify-between">
                  <span>{week.label}</span>
                  <span className="text-muted-foreground">
                    ${week.totalValue.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {week.dateRange}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Search partners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-[200px]"
        />
      </div>
    </div>
  )
}