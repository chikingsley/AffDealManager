"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/components/ui/data-table-row-actions"

export type Offer = {
  id: string
  partner: string
  sources: string[]
  geo: string
  language: string[]
  price: string
  funnels: string[]
  formatted_display: string
  formatted_funnels: string
  last_updated: string
}

export const columns: ColumnDef<Offer>[] = [
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
    accessorKey: "partner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Partner" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("partner")}
          </span>
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
      const sources = row.getValue("sources") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {sources.map((source) => (
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
    accessorKey: "geo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GEO" />
    ),
    cell: ({ row }) => {
      const geo = row.getValue("geo") as string
      return (
        <div className="flex items-center">
          <span className="max-w-[500px] truncate font-medium">
            {geo}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Language" />
    ),
    cell: ({ row }) => {
      const languages = row.getValue("language") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {languages.map((lang) => (
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
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {row.getValue("price")}
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
      const funnels = row.getValue("funnels") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {funnels.map((funnel) => (
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
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
