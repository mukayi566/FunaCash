"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Share2, ChevronDown, ChevronUp, Users, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { getEventById, getTicketTypesByEventId } from "@/lib/event-service"
import type { Event, TicketType } from "@/lib/models/event-models"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { useToast } from "@/hooks/use-toast"

export default function EventDetailsPage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const eventId = params.id as string

  useEffect(() => {
    if (!eventId) return

    fetchEventDetails(eventId)
  }, [eventId])

  const fetchEventDetails = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const [eventResult, ticketTypesResult] = await Promise.all([getEventById(id), getTicketTypesByEventId(id)])

      if (eventResult.success) {
        setEvent(eventResult.event)
      } else {
        setError(eventResult.error || "Failed to fetch event details")
      }

      if (ticketTypesResult.success) {
        setTicketTypes(ticketTypesResult.ticketTypes)
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
      setError("An error occurred while fetching event details")
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

  const handleBuyTickets = (ticketTypeId: string) => {
    if (!event) return

    router.push(`/events/${eventId}/tickets?ticketTypeId=${ticketTypeId}`)
  }

  const handleShare = async () => {
    if (!event) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Funacash Events`,
          url: window.location.href,
        })
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied to clipboard",
          description: "You can now share it with others",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-80 w-full rounded-lg mb-6" />
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="mb-6 text-red-500">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "The event you're looking for doesn't exist or has been removed."}
            </p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-2">
              <div className="relative h-80 w-full mb-6 rounded-lg overflow-hidden">
                <Image
                  src={event.imageUrl || "/placeholder.svg?height=400&width=800&text=Event"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-600">{event.category}</Badge>
                {event.featured && (
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>

              <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatTime(event.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {event.location}, {event.city}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="details">
                <TabsList className="mb-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="organizer">Organizer</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-0">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                    <div className={`relative ${!showFullDescription && "max-h-36 overflow-hidden"}`}>
                      <p className="text-gray-700 whitespace-pre-line">{event.description}</p>

                      {!showFullDescription && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
                      )}
                    </div>

                    {event.description && event.description.length > 200 && (
                      <Button
                        variant="ghost"
                        className="mt-2 flex items-center"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                      >
                        {showFullDescription ? (
                          <>
                            Show Less <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="location" className="mt-0">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Event Location</h2>
                    <p className="text-gray-700 mb-4">
                      {event.location}, {event.city}
                    </p>

                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
                          `${event.location}, ${event.city}, Zambia`,
                        )}`}
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="organizer" className="mt-0">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Event Organizer</h2>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <Users className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-medium">{event.organizerName}</h3>
                        <p className="text-sm text-gray-500">Event Organizer</p>
                      </div>
                    </div>
                    <p className="text-gray-700">Contact the organizer for more information about this event.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Ticket Information */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  {ticketTypes.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-2">No tickets available at the moment.</p>
                      <p className="text-sm text-gray-400">Check back later for updates.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ticketTypes.map((ticket) => (
                        <div key={ticket.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{ticket.name}</h3>
                            <Badge variant={ticket.quantitySold >= ticket.quantity ? "destructive" : "outline"}>
                              {ticket.quantitySold >= ticket.quantity
                                ? "Sold Out"
                                : `${ticket.quantity - ticket.quantitySold} left`}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{ticket.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold">
                              {ticket.price.toFixed(2)} {ticket.currency}
                            </span>
                            <Button
                              size="sm"
                              disabled={ticket.quantitySold >= ticket.quantity}
                              onClick={() => handleBuyTickets(ticket.id!)}
                            >
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Separator />
                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Event
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
