"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { api } from "@/lib/api"
import { getToken, getUser, isLoggedIn } from "@/lib/auth"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatHistory {
  id: string
  title: string
  date: string
  preview: string
  messages: Message[]
}

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<ChatHistory[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState("Student")

  useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoggedIn()) {
      router.push("/login")
      return
    }

    // Get user info
    const user = getUser()
    if (user) {
      setUserName(user.full_name)
    }

    // Load chat history from backend
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      const token = getToken()
      if (!token) return

      const result = await api.getChatHistory(token)
      if (result.chat_logs) {
        // Group messages into a single chat history
        const messages: Message[] = result.chat_logs.map((log: any) => ({
          id: log.id.toString(),
          content: log.message,
          role: log.sender === "user" ? "user" : "assistant",
          timestamp: new Date(log.created_at)
        }))

        if (messages.length > 0) {
          const historyChat: ChatHistory = {
            id: "history",
            title: "Previous Conversations",
            date: "Earlier",
            preview: messages[messages.length - 1].content.slice(0, 40) + "...",
            messages
          }
          setChats([historyChat])
        }
      }
    } catch (err) {
      console.error("Failed to load chat history", err)
    }
  }

  const handleSelectChat = useCallback((id: string) => {
    const chat = chats.find((c) => c.id === id)
    if (chat) {
      setActiveChat(id)
      setCurrentMessages(chat.messages)
    }
    setSidebarOpen(false)
  }, [chats])

  const handleNewChat = useCallback(() => {
    setActiveChat(null)
    setCurrentMessages([])
    setSidebarOpen(false)
  }, [])

  const handleDeleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id))
    if (activeChat === id) {
      setActiveChat(null)
      setCurrentMessages([])
    }
  }, [activeChat])

  const handleSendMessage = useCallback(async (content: string) => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    }

    setCurrentMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const result = await api.sendMessage(content, token)

      const botMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: result.response || "I'm sorry, I could not process your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }

      setCurrentMessages((prev) => [...prev, botMessage])

      // Update or create chat in history
      if (activeChat) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat
              ? { ...c, messages: [...c.messages, userMessage, botMessage], preview: content }
              : c
          )
        )
      } else {
        const newChat: ChatHistory = {
          id: `chat-${Date.now()}`,
          title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
          date: "Just now",
          preview: content,
          messages: [userMessage, botMessage],
        }
        setChats((prev) => [newChat, ...prev])
        setActiveChat(newChat.id)
      }
    } catch (err) {
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "Unable to connect to the helpdesk server. Please check your connection and try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setCurrentMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [activeChat])

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Chat History</SheetTitle>
          <ChatSidebar
            chats={chats}
            activeChat={activeChat}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
          />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          userName={userName}
        />
        <ChatMessages
  messages={currentMessages}
  isLoading={isLoading}
  onSuggestionClick={handleSendMessage}
/>
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask about IT issues, password reset, WiFi, email..."
        />
      </div>
    </div>
  )
}