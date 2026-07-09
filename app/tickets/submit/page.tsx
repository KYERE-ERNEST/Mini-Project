"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, IdCard, AlertTriangle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChatHeader } from "@/components/chat/chat-header"
import { api } from "@/lib/api"
import { getToken, getUser } from "@/lib/auth"

const issueCategories = [
  { value: "Network", label: "Network" },
  { value: "Portal", label: "Portal" },
  { value: "Email", label: "Email" },
  { value: "Computer Lab", label: "Computer Lab" },
  { value: "Other", label: "Other" },
]

export default function SubmitTicketPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [error, setError] = useState("")
  const [userName, setUserName] = useState("Student")

  const [fullName, setFullName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token) {
      router.push("/login")
      return
    }
    if (user) {
      setUserName(user.full_name)
      setFullName(user.full_name)
      setStudentId(user.student_id)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const result = await api.submitTicket({
        issue_category: category,
        issue_description: description
      }, token)

      if (result.ticket_id) {
        setTicketNumber(result.ticket_id)
        setIsSubmitted(true)
      } else {
        setError(result.message || "Failed to submit ticket. Please try again.")
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewTicket = () => {
    setIsSubmitted(false)
    setTicketNumber("")
    setCategory("")
    setDescription("")
    setError("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {!isSubmitted ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Submit a Fault Ticket</CardTitle>
                  <CardDescription>
                    Report an IT issue and our team will assist you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="studentId"
                        placeholder="KsTU/2024/12345"
                        className="pl-10"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Issue Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Issue Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe your issue in detail. Include any error messages you may have seen, when the issue started, and any steps you've already tried."
                    className="min-h-[150px] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide as much detail as possible to help us resolve your issue quickly.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/chat")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto sm:ml-auto"
                  disabled={isLoading || !category}
                >
                  {isLoading ? "Submitting..." : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Ticket Submitted Successfully!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your fault ticket has been received and is being processed.
                </p>
                <div className="inline-block bg-muted rounded-lg px-6 py-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Your Ticket Number</p>
                  <p className="text-2xl font-mono font-bold text-primary">{ticketNumber}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-8">
                  Please save this ticket number. You can use it to track the status of your request.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={handleNewTicket}>
                    Submit Another Ticket
                  </Button>
                  <Link href={`/tickets/track?ticket=${ticketNumber}`}>
                    <Button>Track This Ticket</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}