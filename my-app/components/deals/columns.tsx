"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/components/ui/data-table-row-actions"

export type Deal = {
  id: string
  customers: string[]
  dealDate: string
  individualOffers: string[]
  wh: string
  cpa: number
  crg: number
  cpl: number
  ppl: string
  pplPercent: string
  cap: number
  advertiser: string
  geo: string[]
  language: string[]
  sources: string[]
  funnels: string[]
}

export const columns: ColumnDef<Deal>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "customers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customers" />
    ),
    cell: ({ row }) => {
      const customers = row.getValue("customers") as string[] || []
      if (!customers.length) return null
      return (
        <div className="flex flex-wrap gap-1">
          {customers.map((customerId) => (
            <Badge key={customerId} variant="outline">
              {customerId}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const customers = row.getValue(id) as string[] || []
      return value.some((val: string) => customers.includes(val))
    },
  },
  {
    accessorKey: "dealDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deal Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("dealDate")
      if (!date) return null
      return (
        <div className="flex items-center">
          {date}
        </div>
      )
    },
  },
  {
    accessorKey: "funnels",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Funnels" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("funnels") as string[]
      if (!value?.length) return null
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((funnel) => (
            <Badge key={funnel} variant="outline">
              {funnel}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const funnels = row.getValue(id) as string[]
      return value.some((val: string) => funnels.includes(val))
    },
  },
  {
    accessorKey: "individualOffers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Individual Offers" />
    ),
    cell: ({ row }) => {
      const offers = row.getValue("individualOffers") as string[] || []
      if (!offers.length) return null
      return (
        <div className="flex flex-wrap gap-1">
          {offers.map((offerId) => (
            <Badge key={offerId} variant="outline">
              {offerId}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const offers = row.getValue(id) as string[] || []
      return value.some((val: string) => offers.includes(val))
    },
  },
  {
    accessorKey: "wh",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="WH" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("wh")
      if (!value) return null
      return (
        <div className="flex items-center">
          {value}
        </div>
      )
    },
  },
  {
    accessorKey: "cpa",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPA" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("cpa") as number
      if (!value) return null
      return (
        <div className="flex items-center">
          ${value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "crg",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CRG" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("crg") as number
      if (!value) return null
      return (
        <div className="flex items-center">
          {value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          })}%
        </div>
      )
    },
  },
  {
    accessorKey: "cpl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPL" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("cpl") as number
      if (!value) return null
      return (
        <div className="flex items-center">
          ${value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "ppl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PPL" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("ppl")
      if (!value) return null
      return (
        <div className="flex items-center">
          {value}
        </div>
      )
    },
  },
  {
    accessorKey: "pplPercent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PPL%" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("pplPercent")
      if (!value) return null
      return (
        <div className="flex items-center">
          {value}
        </div>
      )
    },
  },
  {
    accessorKey: "cap",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cap" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("cap") as number
      if (!value) return null
      return (
        <div className="flex items-center">
          {value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "sources",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sources" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("sources") as string[]
      if (!value?.length) return null
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((source) => (
            <Badge key={source} variant="outline">
              {source}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const sources = row.getValue(id) as string[]
      return value.some((val: string) => sources.includes(val))
    },
  },
  {
    accessorKey: "advertiser",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Advertiser" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("advertiser")
      if (!value) return null
      return (
        <div className="flex items-center">
          {value}
        </div>
      )
    },
  },
  {
    accessorKey: "geo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GEO" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("geo") as string[]
      if (!value?.length) return null
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((geo) => (
            <Badge key={geo} variant="outline">
              {geo}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const geos = row.getValue(id) as string[]
      return value.some((val: string) => geos.includes(val))
    },
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Language" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("language") as string[]
      if (!value?.length) return null
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((lang) => (
            <Badge key={lang} variant="outline">
              {lang}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const languages = row.getValue(id) as string[]
      return value.some((val: string) => languages.includes(val))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
