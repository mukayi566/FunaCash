"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, Download, QrCode, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { subscribeToEvent, subscribeToTicketType } from "@/lib/ticket-service"
import type { Ticket, Event, TicketType } from "@/lib/models/event-models"
import { useToast } from "@/hooks/use-toast"

interface TicketCardProps {
  ticket: Ticket
  initialEvent?: Event
  isPast?: boolean
  onViewTicket?: (ticket: Ticket) => void
}

export function TicketCard({ ticket, initialEvent, isPast = false, onViewTicket }: TicketCardProps) {
  const [event, setEvent] = useState<Event | null>(initialEvent || null)
  const [ticketType, setTicketType] = useState<TicketType | null>(null)
  const [isLoading, setIsLoading] = useState(!initialEvent)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let eventUnsubscribe: (() => void) | null = null
    let ticketTypeUnsubscribe: (() => void) | null = null

    const fetchData = () => {
      setIsLoading(true)
      setError(null)

      // Subscribe to event updates
      eventUnsubscribe = subscribeToEvent(ticket.eventId, (eventData, eventError) => {
        if (eventError) {
          setError(eventError)
          setIsLoading(false)
          return
        }
        setEvent(eventData)
        setIsLoading(false)
      })

      // Subscribe to ticket type updates
      ticketTypeUnsubscribe = subscribeToTicketType(ticket.ticketTypeId, (ticketTypeData, ticketTypeError) => {
        if (ticketTypeError) {
          console.warn(`Ticket type error: ${ticketTypeError}`)
          // Don't set error state here as the ticket type is not critical
          return
        }
        setTicketType(ticketTypeData)
      })
    }

    fetchData()

    // Cleanup subscriptions
    return () => {
      if (eventUnsubscribe) eventUnsubscribe()
      if (ticketTypeUnsubscribe) ticketTypeUnsubscribe()
    }
  }, [ticket.eventId, ticket.ticketTypeId])

  const formatDate = (date: any) => {
    if (!date) return "Date unavailable"

    try {
      const eventDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
      return eventDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const formatTime = (date: any) => {
    if (!date) return "Time unavailable"

    try {
      const eventDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
      return eventDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting time:", error)
      return "Invalid time"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800"
      case "used":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownloadTicket = () => {
    toast({
      title: "Ticket downloaded",
      description: "Your ticket has been downloaded successfully",
    })
  }

  const handleViewTicket = () => {
    if (onViewTicket) {
      onViewTicket(ticket)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4">
              <Skeleton className="h-40 md:h-full w-full rounded-t-lg md:rounded-l-lg md:rounded-tr-none" />
            </div>
            <div className="p-6 flex-1">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !event) {
    return (
      <Card>
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading ticket</AlertTitle>
            <AlertDescription>{error || "Unable to load event information for this ticket"}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <p className="font-medium">Ticket ID: {ticket.id}</p>
            <p className="text-sm text-muted-foreground">Purchase date: {formatDate(ticket.purchaseDate)}</p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: "Support",
                    description: "Please contact support for assistance with this ticket",
                  })
                }
              >
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isFeatured = event.title.includes("HOLY TEN") || event.featured

  return (
    <Card className={`overflow-hidden ${isPast ? "opacity-80" : ""}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative h-48 md:h-full w-full">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className={`object-cover ${isPast ? "grayscale" : ""}`}
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=200&width=400&text=Event"
                  }}
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
              {isFeatured && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-amber-500 text-white">Featured</Badge>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-1 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatTime(event.startDate)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {event.location || "Location unavailable"}, {event.city || ""}
                </span>
              </div>
              {ticketType && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">{ticketType.name}</span>
                  <span className="text-muted-foreground ml-2">
                    {ticket.price.toFixed(2)} {ticket.currency}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!isPast && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" onClick={handleViewTicket}>
                      <QrCode className="mr-2 h-4 w-4" />
                      View Ticket
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
              <Button variant="outline" size="sm" onClick={handleDownloadTicket}>
                <Download className="mr-2 h-4 w-4" />
                {isPast ? "Download Receipt" : "Download"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
