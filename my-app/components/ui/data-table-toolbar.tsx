"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { useFilterOptions } from "@/hooks/use-filter-options"
import { Deal } from "@/components/deals/columns"
import { Offer } from "@/components/offers/columns"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  globalFilter?: string
  setGlobalFilter?: (value: string) => void
  type?: 'deals' | 'offers'
}

export function DataTableToolbar<TData>({
  table,
  globalFilter = "",
  setGlobalFilter = () => {},
  type = 'deals',
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter !== ""
  const filterOptions = useFilterOptions(table.getCoreRowModel().rows.map(row => row.original) as (Deal | Offer)[])

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search all fields..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {/* Show customers filter for deals, partner filter for offers */}
        {type === 'deals' ? (
          table.getColumn("customers") && filterOptions.customers?.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("customers")}
              title="Customers"
              options={filterOptions.customers}
            />
          )
        ) : (
          table.getColumn("partner") && filterOptions.partners?.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("partner")}
              title="Partners"
              options={filterOptions.partners}
            />
          )
        )}
        {table.getColumn("sources") && filterOptions.sources?.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("sources")}
            title="Sources"
            options={filterOptions.sources}
          />
        )}
        {table.getColumn("geo") && filterOptions.geos?.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("geo")}
            title="GEO"
            options={filterOptions.geos}
          />
        )}
        {table.getColumn("language") && filterOptions.languages?.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("language")}
            title="Language"
            options={filterOptions.languages}
          />
        )}
        {table.getColumn("funnels") && filterOptions.funnels?.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("funnels")}
            title="Funnels"
            options={filterOptions.funnels}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              setGlobalFilter("")
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
        <Button
          variant="outline"
          className="h-8"
          onClick={() => window.location.href = type === 'deals' ? "/deals/new" : "/offers/new"}
        >
          {type === 'deals' ? "New Deal" : "New Offer"}
        </Button>
      </div>
    </div>
  )
}
