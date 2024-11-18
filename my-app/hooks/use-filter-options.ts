import { Deal } from "@/components/deals/columns"
import { Offer } from "@/components/offers/columns"
import { useMemo } from "react"

type FilterItem = Deal | Offer

export function useFilterOptions(items: FilterItem[]) {
  return useMemo(() => {
    const customers = new Set<string>()
    const partners = new Set<string>()
    const sources = new Set<string>()
    const geos = new Set<string>()
    const languages = new Set<string>()
    const funnels = new Set<string>()

    items.forEach((item) => {
      // Handle Deal specific fields
      if ('customers' in item) {
        item.customers?.forEach(customer => customers.add(customer))
      }
      
      // Handle Offer specific fields
      if ('partner' in item) {
        partners.add(item.partner)
      }

      // Handle common fields
      if (Array.isArray(item.sources)) {
        item.sources?.forEach(source => sources.add(source))
      }
      
      // Handle geo field which might be string or string[]
      if (Array.isArray(item.geo)) {
        item.geo.forEach(g => geos.add(g))
      } else if (item.geo) {
        geos.add(item.geo as string)
      }
      
      // Handle language field which might be string or string[]
      if (Array.isArray(item.language)) {
        item.language.forEach(lang => languages.add(lang))
      } else if (item.language) {
        languages.add(item.language as string)
      }
      
      if (Array.isArray(item.funnels)) {
        item.funnels?.forEach(funnel => funnels.add(funnel))
      }
    })

    // Helper function to create unique keys for options
    const createOptions = (values: Set<string>) => {
      return Array.from(values)
        .sort()
        .map(value => ({
          value,
          label: value,
          key: `${value}-${Date.now()}`
        }))
    }

    return {
      customers: createOptions(customers),
      partners: createOptions(partners),
      sources: createOptions(sources),
      geos: createOptions(geos),
      languages: createOptions(languages),
      funnels: createOptions(funnels)
    }
  }, [items])
}
