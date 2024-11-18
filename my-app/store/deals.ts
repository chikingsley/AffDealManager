import { create } from "zustand"
import { Deal } from "@/components/deals/columns"

interface DealsStore {
  selectedDeals: Deal[]
  setSelectedDeals: (deals: Deal[]) => void
  copyToClipboard: (deals: Deal[]) => void
  clearSelection: () => void
}

export const useDealsStore = create<DealsStore>((set) => ({
  selectedDeals: [],
  setSelectedDeals: (deals) => set({ selectedDeals: deals }),
  copyToClipboard: (deals) => {
    const formattedDeals = deals
      .map((deal) => `${deal.formatted_display}\n${deal.formatted_funnels}`)
      .join("\n\n")
    navigator.clipboard.writeText(formattedDeals)
  },
  clearSelection: () => set({ selectedDeals: [] }),
}))
