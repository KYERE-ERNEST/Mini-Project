"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatHeader } from "@/components/chat/chat-header"
import { api } from "@/lib/api"
import { getToken, getUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface Announcement {
  id: number
  title: string
  description: string
  created_at: string
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("Student")

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token) {
      router.push("/login")
      return
    }
    if (user) setUserName(user.full_name)

    const loadAnnouncements = async () => {
      try {
        const result = await api.getAnnouncements(token)
        if (result.announcements) {
          setAnnouncements(result.announcements)
        }
      } catch (err) {
        console.error("Failed to load announcements", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnnouncements()
  }, [router])

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
              <p className="text-muted-foreground">
                Stay updated with the latest IT news and updates
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading announcements...</p>
              </CardContent>
            </Card>
          ) : filteredAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {announcements.length === 0
                    ? "No announcements yet. Check back later."
                    : "No announcements match your search."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <Card
                key={announcement.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  setExpandedId(expandedId === announcement.id ? null : announcement.id)
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(announcement.created_at)}</span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedId === announcement.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </CardHeader>
                {expandedId === announcement.id && (
                  <CardContent className="pt-0">
                    <div className="border-t border-border pt-4">
                      <p className="text-foreground leading-relaxed">
                        {announcement.description}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Quick Links */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Have questions about an announcement? Contact the IT Helpdesk.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <a href="/tickets/submit">Submit a Ticket</a>
                </Button>
                <Button asChild>
                  <a href="/chat">Chat with Helpdesk</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}