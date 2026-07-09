"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Ticket, CheckCircle, Clock, Users, TrendingUp, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"
import { api } from "@/lib/api"
import { getToken, isAdmin } from "@/lib/auth"

interface TicketItem {
  ticket_id: string
  full_name: string
  issue_description: string
  issue_category: string
  status: string
  created_at: string
}

const statusStyles: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token || !isAdmin()) {
      router.push("/admin/login")
      return
    }

    const loadData = async () => {
      try {
        const result = await api.getAllTickets(token)
        if (result.tickets) setTickets(result.tickets)
      } catch (err) {
        console.error("Failed to load tickets", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  // Calculate real stats
  const totalTickets = tickets.length
  const openTickets = tickets.filter(t => t.status === "open").length
  const inProgressTickets = tickets.filter(t => t.status === "in_progress").length
  const resolvedTickets = tickets.filter(t => t.status === "resolved").length

  // Category breakdown
  const categories = ["Network", "Portal", "Email", "Computer Lab", "Other"]
  const categoryColors: Record<string, string> = {
    Network: "bg-blue-500",
    Portal: "bg-green-500",
    Email: "bg-yellow-500",
    "Computer Lab": "bg-purple-500",
    Other: "bg-gray-500",
  }
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: tickets.filter(t => t.issue_category === cat).length,
    color: categoryColors[cat],
    percentage: totalTickets > 0
      ? Math.round((tickets.filter(t => t.issue_category === cat).length / totalTickets) * 100)
      : 0
  }))

  const recentTickets = tickets.slice(0, 5)

  const stats = [
    {
      name: "Total Tickets",
      value: totalTickets.toString(),
      icon: Ticket,
      description: "All time tickets",
    },
    {
      name: "Open Tickets",
      value: openTickets.toString(),
      icon: Clock,
      description: "Awaiting resolution",
    },
    {
      name: "Resolved Tickets",
      value: resolvedTickets.toString(),
      icon: CheckCircle,
      description: "Successfully resolved",
    },
    {
      name: "In Progress",
      value: inProgressTickets.toString(),
      icon: Users,
      description: "Being worked on",
    },
  ]

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    if (diff < 60) return `${diff} mins ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`
    return `${Math.floor(diff / 1440)} days ago`
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of IT helpdesk performance and activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Tickets & Category Breakdown */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Tickets</CardTitle>
                  <CardDescription>Latest support requests from students</CardDescription>
                </div>
                <a
                  href="/admin/tickets"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading tickets...</p>
              ) : recentTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tickets yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <div
                      key={ticket.ticket_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">
                            {ticket.ticket_id}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[ticket.status] || "bg-gray-100 text-gray-800"}`}>
                            {ticket.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="font-medium text-sm truncate">{ticket.issue_description}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.full_name} • {ticket.issue_category}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {formatTime(ticket.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Categories</CardTitle>
              <CardDescription>Distribution by issue type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryCounts.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">
                        {category.count} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Key helpdesk performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">
                  {totalTickets > 0 ? `${Math.round((resolvedTickets / totalTickets) * 100)}%` : "0%"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Resolution Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-green-600">{openTickets}</p>
                <p className="text-sm text-muted-foreground mt-1">Pending Tickets</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-blue-600">{resolvedTickets}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}