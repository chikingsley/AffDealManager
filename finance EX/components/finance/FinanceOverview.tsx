import { useState } from 'react'
import { Header } from './Header'
import { DealsTable } from './DealsTable'
import { useDeals } from '@/hooks/useDeals'

export default function FinanceOverview() {
  const [selectedWeek, setSelectedWeek] = useState("week-52")
  const [searchTerm, setSearchTerm] = useState("")
  const { deals, weekOptions } = useDeals()
  
  const filteredDeals = deals.filter(deal => 
    deal.partner.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Header 
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        weekOptions={weekOptions}
      />
      <DealsTable deals={filteredDeals} />
    </div>
  )
}