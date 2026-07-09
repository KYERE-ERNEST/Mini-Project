"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Clock, CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatHeader } from "@/components/chat/chat-header"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { getToken, getUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface TicketDetails {
  ticket_id: string
  issue_category: string
  issue_description: string
  status: "open" | "in_progress" | "resolved"
  created_at: string
}

const statusConfig = {
  open: {
    label: "Open",
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  in_progress: {
    label: "In Progress",
    icon: RefreshCw,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
  },
}

function TrackTicketContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ticketNumber, setTicketNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [ticket, setTicket] = useState<TicketDetails | null>(null)
  const [error, setError] = useState("")
  const [userName, setUserName] = useState("Student")

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token) {
      router.push("/login")
      return
    }
    if (user) setUserName(user.full_name)

    const ticketParam = searchParams.get("ticket")
    if (ticketParam) {
      setTicketNumber(ticketParam)
      handleSearch(ticketParam)
    }
  }, [searchParams, router])

  const handleSearch = async (searchTicket?: string) => {
    const ticketToSearch = searchTicket || ticketNumber
    if (!ticketToSearch.trim()) {
      setError("Please enter a ticket number")
      return
    }

    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    setIsSearching(true)
    setError("")
    setTicket(null)

    try {
      const result = await api.trackTicket(ticketToSearch.trim(), token)
      if (result.ticket) {
        setTicket(result.ticket)
      } else {
        setError("Ticket not found. Please check the ticket number and try again.")
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  const currentStatus = ticket?.status as keyof typeof statusConfig

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Track Your Ticket</CardTitle>
                <CardDescription>
                  Enter your ticket number to check the status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="ticketNumber" className="sr-only">Ticket Number</Label>
                <Input
                  id="ticketNumber"
                  placeholder="Enter ticket number (e.g., TKT-7CD336EA)"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
            {error && (
              <p className="mt-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {ticket && currentStatus && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ticket Number</p>
                  <CardTitle className="text-xl font-mono">{ticket.ticket_id}</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={cn("flex items-center gap-1.5 px-3 py-1.5", statusConfig[currentStatus].color)}
                >
                  {(() => {
                    const StatusIcon = statusConfig[currentStatus].icon
                    return <StatusIcon className="h-4 w-4" />
                  })()}
                  {statusConfig[currentStatus].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Submitted: {formatDate(ticket.created_at)}</span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge variant="secondary">{ticket.issue_category}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Issue Description</p>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-foreground">{ticket.issue_description}</p>
                </div>
              </div>

              {/* Status Progress */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <div className="flex items-center gap-2">
                  {(["open", "in_progress", "resolved"] as const).map((status, index) => {
                    const statuses = ["open", "in_progress", "resolved"]
                    const currentIndex = statuses.indexOf(ticket.status)
                    const isActive = index <= currentIndex
                    const isCurrent = status === ticket.status

                    return (
                      <div key={status} className="flex items-center gap-2 flex-1">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium",
                          isActive
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                        {index < 2 && (
                          <div className={cn(
                            "h-1 flex-1 rounded",
                            isActive && !isCurrent ? "bg-primary" : "bg-muted"
                          )} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Open</span>
                  <span>In Progress</span>
                  <span>Resolved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!ticket && !error && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  {"Don't"} have a ticket number? You can submit a new ticket or chat with our IT helpdesk.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <a href="/tickets/submit">Submit New Ticket</a>
                  </Button>
                  <Button asChild>
                    <a href="/chat">Chat with Helpdesk</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function TrackTicketPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TrackTicketContent />
    </Suspense>
  )
}