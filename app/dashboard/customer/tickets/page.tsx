"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TicketIcon, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TicketCard } from "@/app/components/ticket-card"
import { TicketDetail } from "@/app/components/ticket-detail"
import { subscribeToUserTickets } from "@/lib/ticket-service"
import type { Ticket, Event } from "@/lib/models/event-models"
import { useToast } from "@/hooks/use-toast"

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [events, setEvents] = useState<Record<string, Event>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const setupSubscription = () => {
      // Get user ID from cookie
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_id="))
        ?.split("=")[1]

      if (!userId) {
        setError("Authentication required")
        toast({
          title: "Authentication required",
          description: "Please log in to view your tickets",
          variant: "destructive",
        })

        // Redirect to login
        router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      setIsLoading(true)
      setError(null)

      // Subscribe to user tickets with real-time updates
      unsubscribe = subscribeToUserTickets(userId, (ticketsData, eventsData, ticketsError) => {
        setIsLoading(false)
        setIsRefreshing(false)

        if (ticketsError) {
          setError(ticketsError)
          return
        }

        setTickets(ticketsData)
        setEvents(eventsData)
      })
    }

    setupSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [router, toast])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // The real-time subscription will automatically refresh the data
    // This is just to provide visual feedback to the user
    setTimeout(() => {
      if (isRefreshing) {
        setIsRefreshing(false)
      }
    }, 2000)
  }

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDialogOpen(true)
  }

  const upcomingTickets = tickets.filter((ticket) => {
    const event = events[ticket.eventId]
    if (!event) return false

    const eventDate =
      event.startDate instanceof Date
        ? event.startDate
        : event.startDate.toDate
          ? event.startDate.toDate()
          : new Date(event.startDate)

    return eventDate > new Date() && ticket.status === "valid"
  })

  const pastTickets = tickets.filter((ticket) => {
    const event = events[ticket.eventId]
    if (!event) return false

    const eventDate =
      event.startDate instanceof Date
        ? event.startDate
        : event.startDate.toDate
          ? event.startDate.toDate()
          : new Date(event.startDate)

    return eventDate <= new Date() || ticket.status !== "valid"
  })

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your event tickets</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="grid gap-6">
          {Array(2)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
            ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6 text-gray-400">
            <TicketIcon className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Tickets Found</h2>
          <p className="text-gray-600 mb-6">You haven't purchased any tickets yet.</p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-0">
            <div className="grid gap-6">
              {upcomingTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  initialEvent={events[ticket.eventId]}
                  onViewTicket={handleViewTicket}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            <div className="grid gap-6">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} initialEvent={events[ticket.eventId]} isPast={true} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Ticket</DialogTitle>
          </DialogHeader>
          {selectedTicket && <TicketDetail ticketId={selectedTicket.id} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
