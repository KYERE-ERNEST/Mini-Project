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

interface ChatHeaderProps {
  onToggleSidebar?: () => void
  userName?: string
}

export function ChatHeader({ onToggleSidebar, userName = "Student" }: ChatHeaderProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">K</span>
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
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">student@kstu.edu.gh</p>
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
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
