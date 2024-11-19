"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onReorder?: (draggedId: string, targetId: string) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onReorder,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 50

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: {
        pageSize,
        pageIndex: currentPage,
      },
    },
  })

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return
    
    const sourceId = result.draggableId
    const destinationId = table.getRowModel().rows[result.destination.index].id
    
    onReorder(sourceId, destinationId)
  }

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <Droppable droppableId="table">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <Draggable
                        key={row.id}
                        draggableId={row.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            data-state={row.getIsSelected() && "selected"}
                            className={`text-sm ${
                              snapshot.isDragging ? "bg-muted" : ""
                            }`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-sm"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </div>
      </DragDropContext>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          className="text-sm h-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex w-[100px] items-center justify-center text-sm text-muted-foreground">
          Page {currentPage + 1} of{" "}
          {Math.ceil(table.getFilteredRowModel().rows.length / pageSize)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => 
            Math.min(
              Math.ceil(table.getFilteredRowModel().rows.length / pageSize) - 1,
              prev + 1
            )
          )}
          disabled={
            currentPage >=
            Math.ceil(table.getFilteredRowModel().rows.length / pageSize) - 1
          }
          className="text-sm h-8"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
