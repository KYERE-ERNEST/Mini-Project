"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Search, ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"
import { api } from "@/lib/api"
import { getToken, isAdmin } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
  created_at: string
}

const categories = ["Portal", "Network", "Email", "Computer Lab", "General"]

export default function AdminFAQsPage() {
  const router = useRouter()
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [category, setCategory] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token || !isAdmin()) {
      router.push("/admin/login")
      return
    }
    loadFAQs()
  }, [router])

  const loadFAQs = async () => {
    const token = getToken()
    if (!token) return
    try {
      const result = await api.getFaqs(token)
      if (result.faqs) setFAQs(result.faqs)
    } catch (err) {
      console.error("Failed to load FAQs", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateDialog = () => {
    setEditingFAQ(null)
    setQuestion("")
    setAnswer("")
    setCategory("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (faq: FAQ) => {
    setEditingFAQ(faq)
    setQuestion(faq.question)
    setAnswer(faq.answer)
    setCategory(faq.category)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!question.trim() || !answer.trim() || !category) return
    const token = getToken()
    if (!token) return

    setIsSaving(true)
    try {
      if (editingFAQ) {
        await api.updateFaq(editingFAQ.id, { question, answer, category }, token)
        setFAQs(prev =>
          prev.map(f => f.id === editingFAQ.id ? { ...f, question, answer, category } : f)
        )
      } else {
        const result = await api.addFaq({ question, answer, category }, token)
        if (result.message === "FAQ added successfully!") {
          await loadFAQs()
        }
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Failed to save FAQ", err)
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = (faq: FAQ) => {
    setFaqToDelete(faq)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!faqToDelete) return
    const token = getToken()
    if (!token) return

    setIsDeleting(true)
    try {
      await api.deleteFaq(faqToDelete.id, token)
      setFAQs(prev => prev.filter(f => f.id !== faqToDelete.id))
      setDeleteDialogOpen(false)
      setFaqToDelete(null)
    } catch (err) {
      console.error("Failed to delete FAQ", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">FAQ Management</h1>
            <p className="text-muted-foreground">
              Manage frequently asked questions for the helpdesk
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add New FAQ
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading FAQs...</p>
              </CardContent>
            </Card>
          ) : filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {faqs.length === 0 ? "No FAQs yet. Add your first FAQ!" : "No FAQs found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {faq.category}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{faq.question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); openEditDialog(faq) }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); confirmDelete(faq) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {expandedId === faq.id
                      ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                </div>
                {expandedId === faq.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-border pt-4">
                      <p className="text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                      <p className="text-xs text-muted-foreground mt-3">
                        Created: {new Date(faq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFAQ ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            <DialogDescription>
              {editingFAQ ? "Update the question and answer below" : "Create a new frequently asked question"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Enter the question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!question || !answer || !category || isSaving}>
              {isSaving ? "Saving..." : editingFAQ ? "Save Changes" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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