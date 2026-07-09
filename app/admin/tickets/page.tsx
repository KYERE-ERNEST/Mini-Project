"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AdminLayout } from "@/components/admin/admin-layout"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { getToken, isAdmin } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface Ticket {
  id: number
  ticket_id: string
  full_name: string
  student_id: string
  issue_category: string
  issue_description: string
  status: "open" | "in_progress" | "resolved"
  created_at: string
}

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
]

const statusStyles: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token || !isAdmin()) {
      router.push("/admin/login")
      return
    }
    loadTickets()
  }, [router])

  const loadTickets = async () => {
    const token = getToken()
    if (!token) return
    try {
      const result = await api.getAllTickets(token)
      if (result.tickets) setTickets(result.tickets)
    } catch (err) {
      console.error("Failed to load tickets", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.issue_description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus
    const matchesCategory = filterCategory === "all" || ticket.issue_category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return
    const token = getToken()
    if (!token) return

    setIsUpdating(true)
    try {
      const result = await api.updateTicketStatus(selectedTicket.ticket_id, newStatus, token)
      if (result.message === "Ticket status updated successfully!") {
        setTickets(prev =>
          prev.map(t =>
            t.ticket_id === selectedTicket.ticket_id
              ? { ...t, status: newStatus as Ticket["status"] }
              : t
          )
        )
        setIsDialogOpen(false)
        setSelectedTicket(null)
        setNewStatus("")
      }
    } catch (err) {
      console.error("Failed to update ticket", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const openUpdateDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setNewStatus(ticket.status)
    setIsDialogOpen(true)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ticket Management</h1>
          <p className="text-muted-foreground">View and manage all support tickets</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket ID, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Network">Network</SelectItem>
              <SelectItem value="Portal">Portal</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Computer Lab">Computer Lab</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Ticket ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">Loading tickets...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No tickets found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.ticket_id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{ticket.ticket_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.full_name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {ticket.issue_category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{ticket.issue_category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(statusStyles[ticket.status])}
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateDialog(ticket)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </p>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Ticket Status</DialogTitle>
            <DialogDescription>
              Change the status for ticket {selectedTicket?.ticket_id}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <p className="text-sm">{selectedTicket.full_name}</p>
              </div>
              <div className="space-y-2">
                <Label>Issue</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.issue_description}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}