"use client"

import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export interface Lead {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  call_status: string
  created_at: string
}

const callStatusColors = {
  NEW: 'bg-blue-50 text-blue-700',
  CONTACTED: 'bg-yellow-50 text-yellow-700',
  QUALIFIED: 'bg-green-50 text-green-700',
  DISQUALIFIED: 'bg-red-50 text-red-700',
  CALLBACK: 'bg-purple-50 text-purple-700',
}

type CallStatus = keyof typeof callStatusColors

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<CallStatus | "ALL">("ALL")
  const [rowOrder, setRowOrder] = useState<string[]>([])
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([
    "NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED", "CALLBACK"
  ])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setLeads(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Initialize row order when leads change
    setRowOrder(leads.map(lead => lead.id.toString()))
  }, [leads])

  useEffect(() => {
    // Update available statuses whenever leads change
    const newStatuses = new Set(availableStatuses)
    leads.forEach(lead => {
      if (lead.call_status && !newStatuses.has(lead.call_status.toUpperCase())) {
        newStatuses.add(lead.call_status.toUpperCase())
      }
    })
    if (newStatuses.size !== availableStatuses.length) {
      setAvailableStatuses(Array.from(newStatuses))
    }
  }, [leads])

  const handleReorder = (draggedId: string, targetId: string) => {
    const newOrder = [...rowOrder]
    const draggedIndex = newOrder.indexOf(draggedId)
    const targetIndex = newOrder.indexOf(targetId)
    
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedId)
    
    setRowOrder(newOrder)
  }

  const orderedLeads = [...leads].sort((a, b) => {
    const aIndex = rowOrder.indexOf(a.id.toString())
    const bIndex = rowOrder.indexOf(b.id.toString())
    return aIndex - bIndex
  })

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "created_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("created_date")
        return <span className="text-sm">{date ? new Date(date as string).toLocaleDateString() : '-'}</span>
      },
    },
    {
      accessorKey: "country",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            Country
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-sm">{row.getValue("country")}</span>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-sm">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "call_status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            Call Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = (row.getValue("call_status") as string)?.toUpperCase() || "NEW"
        return (
          <Badge 
            className={`text-xs font-medium ${
              callStatusColors[status as CallStatus] || 'bg-gray-50 text-gray-700'
            }`}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "campaign",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            Campaign
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-sm">{row.getValue("campaign")}</span>,
    },
    {
      accessorKey: "affiliate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            Affiliate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-sm">{row.getValue("affiliate")}</span>,
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            First Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-sm">{row.getValue("first_name")}</span>,
    },
    {
      accessorKey: "last_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            Last Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-sm">{row.getValue("last_name")}</span>,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-sm font-medium"
          >
            Phone
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-sm">{row.getValue("phone")}</span>,
    },
  ]

  const filteredLeads = orderedLeads.filter(lead => {
    const matchesSearch = searchTerm === "" || 
      Object.values(lead).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesStatus = statusFilter === "ALL" || lead.call_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 items-end">
            <div className="w-[300px]">
              <Label htmlFor="search" className="text-sm">Search</Label>
              <Input
                id="search"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="w-48">
              <Label htmlFor="status" className="text-sm">Status Filter</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as CallStatus | "ALL")}
              >
                <SelectTrigger id="status" className="h-9 text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-sm">All Statuses</SelectItem>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status} className="text-sm">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DataTable 
          columns={columns} 
          data={filteredLeads}
          onReorder={handleReorder}
        />
      </CardContent>
    </Card>
  )
}
