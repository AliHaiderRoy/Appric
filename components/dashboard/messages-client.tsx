"use client"

import { useEffect, useState, useTransition } from "react"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Mail, Trash2, Reply, Archive, Inbox } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  markContactMessageRead,
  replyToContactMessage,
  updateContactMessageStatus,
  deleteContactMessage,
  type ContactMessage,
} from "@/actions/contact-messages"
import type { UserRole } from "@/lib/auth/roles"

interface MessagesClientProps {
  initialMessages: ContactMessage[]
  role: UserRole
}

function statusVariant(status: ContactMessage["status"]) {
  switch (status) {
    case "new":
      return "default"
    case "read":
      return "secondary"
    case "replied":
      return "outline"
    default:
      return "outline"
  }
}

export function MessagesClient({ initialMessages, role }: MessagesClientProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [selectedId, setSelectedId] = useState<string | null>(initialMessages[0]?.id ?? null)
  const [replyText, setReplyText] = useState("")
  const [isPending, startTransition] = useTransition()

  const selected = messages.find((m) => m.id === selectedId) ?? null
  const newCount = messages.filter((m) => m.status === "new").length

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("contact-messages-inbox")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          const incoming: ContactMessage = {
            id: String(row.id),
            name: String(row.name),
            email: String(row.email),
            company: row.company ? String(row.company) : null,
            message: String(row.message),
            status: row.status as ContactMessage["status"],
            admin_reply: null,
            replied_by: null,
            read_by: null,
            read_at: null,
            replied_at: null,
            created_at: String(row.created_at),
          }
          setMessages((prev) => [incoming, ...prev.filter((m) => m.id !== incoming.id)])
          toast.info(`New message from ${incoming.name}`, {
            description: incoming.message.slice(0, 80),
          })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contact_messages" },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          setMessages((prev) =>
            prev.map((m) =>
              m.id === String(row.id)
                ? {
                    ...m,
                    status: row.status as ContactMessage["status"],
                    admin_reply: row.admin_reply ? String(row.admin_reply) : null,
                    replied_at: row.replied_at ? String(row.replied_at) : null,
                    read_at: row.read_at ? String(row.read_at) : null,
                  }
                : m
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSelect = (msg: ContactMessage) => {
    setSelectedId(msg.id)
    setReplyText(msg.admin_reply ?? "")
    if (msg.status === "new") {
      startTransition(async () => {
        await markContactMessageRead(msg.id)
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "read" as const } : m))
        )
      })
    }
  }

  const handleReply = () => {
    if (!selected) return
    startTransition(async () => {
      const result = await replyToContactMessage(selected.id, replyText)
      if (result.error) toast.error(result.error)
      else {
        toast.success("Reply saved")
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selected.id
              ? { ...m, status: "replied" as const, admin_reply: replyText, replied_at: new Date().toISOString() }
              : m
          )
        )
      }
    })
  }

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const result = await updateContactMessageStatus(id, "archived")
      if (result.error) toast.error(result.error)
      else {
        toast.success("Message archived")
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "archived" as const } : m)))
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this message permanently?")) return
    startTransition(async () => {
      const result = await deleteContactMessage(id)
      if (result.error) toast.error(result.error)
      else {
        toast.success("Message deleted")
        setMessages((prev) => prev.filter((m) => m.id !== id))
        if (selectedId === id) setSelectedId(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            Contact Inbox
          </h1>
          <p className="text-muted-foreground">
            Real-time messages from the public contact form — {newCount} new
          </p>
        </div>
        <Badge variant={newCount > 0 ? "destructive" : "secondary"} className="w-fit">
          Live sync enabled
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[600px]">
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Messages ({messages.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[560px] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors ${
                    selectedId === msg.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{msg.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                    </div>
                    <Badge variant={statusVariant(msg.status)} className="shrink-0 text-[10px]">
                      {msg.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selected ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{selected.name}</CardTitle>
                    <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">
                      {selected.email}
                    </a>
                    {selected.company && (
                      <p className="text-sm text-muted-foreground mt-1">{selected.company}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleArchive(selected.id)} disabled={isPending}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    {role === "admin" && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(selected.id)} disabled={isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Received {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    Admin reply (internal record — send email separately)
                  </label>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    placeholder="Write your reply notes or copy for email..."
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleReply} disabled={isPending || !replyText.trim()}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Reply
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={`mailto:${selected.email}?subject=Re: Your inquiry to APPRIC`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Open in Email
                      </a>
                    </Button>
                  </div>
                </div>

                {selected.admin_reply && selected.replied_at && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                    <p className="text-xs font-medium text-green-600 mb-1">Saved reply</p>
                    <p className="text-sm whitespace-pre-wrap">{selected.admin_reply}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(selected.replied_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
              Select a message to read and reply
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
