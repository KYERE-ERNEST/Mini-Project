"use client"

import { useState, useEffect } from "react"
import { Trash2, Search, Bell, Calendar, Send, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminLayout } from "@/components/admin/admin-layout"
import { api } from "@/lib/api"
import { getToken, isAdmin } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface Announcement {
  id: number
  title: string
  description: string
  created_at: string
}

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token || !isAdmin()) {
      router.push("/admin/login")
      return
    }
    loadAnnouncements()
  }, [router])

  const loadAnnouncements = async () => {
    const token = getToken()
    if (!token) return
    try {
      const result = await api.getAnnouncements(token)
      if (result.announcements) setAnnouncements(result.announcements)
    } catch (err) {
      console.error("Failed to load announcements", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    const token = getToken()
    if (!token) return

    setIsSubmitting(true)
    try {
      const result = await api.createAnnouncement({ title, description }, token)
      if (result.message === "Announcement created successfully!") {
        setTitle("")
        setDescription("")
        setSuccessMessage("Announcement published successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
        await loadAnnouncements()
      }
    } catch (err) {
      console.error("Failed to publish announcement", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!announcementToDelete) return
    const token = getToken()
    if (!token) return

    setIsDeleting(true)
    try {
      await api.deleteAnnouncement(announcementToDelete.id, token)
      setAnnouncements(prev => prev.filter(a => a.id !== announcementToDelete.id))
      setDeleteDialogOpen(false)
      setAnnouncementToDelete(null)
    } catch (err) {
      console.error("Failed to delete announcement", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements Management</h1>
          <p className="text-muted-foreground">Create and manage announcements for students</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create Announcement Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Announcement
              </CardTitle>
              <CardDescription>
                Compose and publish a new announcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                  {successMessage}
                </div>
              )}
              <form onSubmit={handlePublish} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Announcement title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Write your announcement..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !title || !description}
                >
                  {isSubmitting ? "Publishing..." : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Announcement
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Announcements List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3">
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
                        ? "No announcements yet. Create your first one!"
                        : "No announcements found"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {announcement.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => confirmDelete(announcement)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{announcementToDelete?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}