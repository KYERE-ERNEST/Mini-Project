"use client"

import { Menu, Settings, LogOut, Ticket, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { getToken } from "@/lib/auth"

interface ChatHeaderProps {
  onToggleSidebar?: () => void
  userName?: string
}

export function ChatHeader({ onToggleSidebar, userName = "Student" }: ChatHeaderProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const token = getToken()
        if (!token) return
        const result = await api.getAnnouncements(token)
        if (result.announcements) {
          setAnnouncements(result.announcements.slice(0, 3))
        }
      } catch (err) {
        console.error("Failed to load announcements", err)
      }
    }
    loadAnnouncements()
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white">
            <img src="/kstu-logo.png" alt="KsTU Logo" className="h-10 w-10 object-contain"/>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">KsTU IT Helpdesk</h1>
            <p className="text-xs text-muted-foreground">Kumasi Technical University</p>
          </div>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        <Link href="/chat">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Chat
          </Button>
        </Link>
        <Link href="/tickets/submit">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Submit Ticket
          </Button>
        </Link>
        <Link href="/tickets/track">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Track Ticket
          </Button>
        </Link>
        <Link href="/announcements">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Announcements
          </Button>
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {announcements.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-sm">Latest Announcements</h3>
              </div>
              {announcements.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No announcements yet
                </div>
              ) : (
                <div>
                  {announcements.map((a: any) => (
                    <div key={a.id} className="p-3 border-b border-border hover:bg-muted/50">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                    </div>
                  ))}
                  <div className="p-2">
                    <Link href="/announcements" onClick={() => setShowNotifications(false)}>
                      <Button variant="ghost" size="sm" className="w-full text-primary">
                        View all announcements
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">KsTU Student</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/chat">
                <Search className="mr-2 h-4 w-4" />
                Chat
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/tickets/submit">
                <Ticket className="mr-2 h-4 w-4" />
                Submit Ticket
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/tickets/track">
                <Search className="mr-2 h-4 w-4" />
                Track Ticket
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/announcements">
                <Bell className="mr-2 h-4 w-4" />
                Announcements
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem asChild>
              <Link href="/tickets/submit">
                <Ticket className="mr-2 h-4 w-4" />
                Submit Ticket
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/announcements">
                <Bell className="mr-2 h-4 w-4" />
                Announcements
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}