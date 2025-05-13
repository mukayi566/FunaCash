"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, MapPin, AlertTriangle, ChevronLeft, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getEventById, getTicketTypesByEventId, purchaseTicket } from "@/lib/event-service"
import type { Event, TicketType } from "@/lib/models/event-models"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { useToast } from "@/hooks/use-toast"

export default function TicketPurchasePage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketType, setTicketType] = useState<TicketType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [attendeeName, setAttendeeName] = useState("")
  const [attendeeEmail, setAttendeeEmail] = useState("")
  const [attendeePhone, setAttendeePhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const eventId = params.id as string
  const ticketTypeId = searchParams.get("ticketTypeId")

  useEffect(() => {
    if (!eventId || !ticketTypeId) {
      setError("Invalid ticket information")
      setIsLoading(false)
      return
    }

    fetchTicketDetails(eventId, ticketTypeId)

    // Pre-fill form with user data if available
    const storedUserId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_id="))
      ?.split("=")[1]

    if (storedUserId) {
      // In a real app, you would fetch user details here
      // For demo purposes, we'll use placeholder data
      setAttendeeName("Demo User")
      setAttendeeEmail("demo@example.com")
      setAttendeePhone("+260123456789")
    }
  }, [eventId, ticketTypeId])

  const fetchTicketDetails = async (eventId: string, ticketTypeId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const [eventResult, ticketTypesResult] = await Promise.all([
        getEventById(eventId),
        getTicketTypesByEventId(eventId),
      ])

      if (eventResult.success) {
        setEvent(eventResult.event)
      } else {
        setError(eventResult.error || "Failed to fetch event details")
      }

      if (ticketTypesResult.success) {
        const selectedTicketType = ticketTypesResult.ticketTypes.find((t) => t.id === ticketTypeId)

        if (selectedTicketType) {
          setTicketType(selectedTicketType)
        } else {
          setError("Ticket type not found")
        }
      } else {
        setError(ticketTypesResult.error || "Failed to fetch ticket types")
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error)
      setError("An error occurred while fetching ticket details")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: any) => {
    if (!date) return ""

    const eventDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
    return eventDate.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (date: any) => {
    if (!date) return ""

    const eventDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
    return eventDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleQuantityChange = (value: number) => {
    if (!ticketType) return

    const newQuantity = Math.max(1, Math.min(value, ticketType.maxPerPurchase))
    setQuantity(newQuantity)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!event || !ticketType) return

    try {
      setIsSubmitting(true)

      // Get user ID from cookie
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_id="))
        ?.split("=")[1]

      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please log in to purchase tickets",
          variant: "destructive",
        })

        // Redirect to login
        router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)
        return
      }

      // Generate a transaction ID
      const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // Purchase ticket
      const result = await purchaseTicket({
        ticketTypeId: ticketType.id!,
        eventId: event.id!,
        userId,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        quantity,
        transactionId,
      })

      if (result.success) {
        toast({
          title: "Tickets purchased successfully!",
          description: `You've purchased ${quantity} ticket${quantity > 1 ? "s" : ""} for ${event.title}. View them in your dashboard.`,
        })

        // Redirect to tickets page
        router.push(`/dashboard/customer/tickets`)
      } else {
        toast({
          title: "Failed to purchase tickets",
          description: result.error || "Please try again later",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error purchasing tickets:", error)
      toast({
        title: "Error",
        description: "An error occurred while processing your purchase",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-8 w-64 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Skeleton className="h-64 w-full rounded-lg mb-6" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-6" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                </div>
                <div>
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !event || !ticketType) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="mb-6 text-red-500">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Ticket Not Available</h1>
            <p className="text-gray-600 mb-6">
              {error || "The ticket you're looking for doesn't exist or has been sold out."}
            </p>
            <Button asChild>
              <Link href={`/events/${eventId}`}>Back to Event</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const totalPrice = ticketType.price * quantity

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link href={`/events/${eventId}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Event
              </Link>
            </Button>

            <h1 className="text-2xl font-bold mb-6">Purchase Tickets</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Ticket Form */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Attendee Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="attendeeName">Full Name</Label>
                        <Input
                          id="attendeeName"
                          value={attendeeName}
                          onChange={(e) => setAttendeeName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="attendeeEmail">Email</Label>
                        <Input
                          id="attendeeEmail"
                          type="email"
                          value={attendeeEmail}
                          onChange={(e) => setAttendeeEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="attendeePhone">Phone Number</Label>
                        <Input
                          id="attendeePhone"
                          value={attendeePhone}
                          onChange={(e) => setAttendeePhone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Number of Tickets</Label>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={ticketType.maxPerPurchase}
                            value={quantity}
                            onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value))}
                            className="w-20 mx-2 text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= ticketType.maxPerPurchase}
                          >
                            +
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Maximum {ticketType.maxPerPurchase} tickets per purchase
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : "Continue to Payment"}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </div>

              {/* Order Summary */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium">{event.title}</h3>
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
                          {event.location}, {event.city}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>{ticketType.name}</span>
                        <span>
                          {ticketType.price.toFixed(2)} {ticketType.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>Quantity</span>
                        <span>× {quantity}</span>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>
                          {totalPrice.toFixed(2)} {ticketType.currency}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <div className="flex items-center justify-center w-full text-sm text-gray-500">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>Secure payment processing</span>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
