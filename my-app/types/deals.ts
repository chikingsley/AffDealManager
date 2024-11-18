export interface Deal {
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

export interface Column {
  id: string
  title: string
  filterFn?: (row: any, id: string, value: any) => boolean
}

export interface DealTableToolbarProps<TData> {
  table: TData
}

export interface DataTablePaginationProps<TData> {
  table: TData
}

export interface DataTableViewOptionsProps<TData> {
  table: TData
}

export interface DataTableColumnHeaderProps<TData> {
  column: TData
  title: string
}

export interface DataTableFacetedFilterProps {
  column: any
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}
