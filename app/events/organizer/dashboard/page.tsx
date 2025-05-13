"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, BarChart3, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getEventOrganizerByUserId, getEvents, deleteEvent } from "@/lib/event-service"
import type { Event, EventOrganizer } from "@/lib/models/event-models"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { useToast } from "@/hooks/use-toast"

export default function OrganizerDashboardPage() {
  const [organizer, setOrganizer] = useState<EventOrganizer | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchOrganizerData()
  }, [])

  const fetchOrganizerData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get user ID from cookie
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_id="))
        ?.split("=")[1]

      if (!userId) {
        setError("Authentication required")
        toast({
          title: "Authentication required",
          description: "Please log in to access the organizer dashboard",
          variant: "destructive",
        })

        // Redirect to login
        router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      // Get organizer data
      const organizerResult = await getEventOrganizerByUserId(userId)

      if (!organizerResult.success) {
        // If not an organizer, redirect to registration
        router.push("/events/organizer/register")
        return
      }

      setOrganizer(organizerResult.organizer)

      // Get organizer's events
      const eventsResult = await getEvents({
        organizerId: organizerResult.organizer.id,
      })

      if (eventsResult.success) {
        setEvents(eventsResult.events)
      }
    } catch (error) {
      console.error("Error fetching organizer data:", error)
      setError("An error occurred while fetching organizer data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = () => {
    router.push("/events/organizer/create")
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/organizer/edit/${eventId}`)
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return

    try {
      setIsDeleting(true)

      const result = await deleteEvent(eventToDelete)

      if (result.success) {
        setEvents(events.filter((event) => event.id !== eventToDelete))
        toast({
          title: "Event deleted",
          description: "The event has been deleted successfully",
        })
      } else {
        toast({
          title: "Failed to delete event",
          description: result.error || "Please try again later",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the event",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setEventToDelete(null)
    }
  }

  const formatDate = (date: any) => {
    if (!date) return ""

    const eventDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
    return eventDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))}
            </div>

            <Skeleton className="h-10 w-32 mb-6" />

            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-lg" />
                ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="mb-6 text-red-500">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchOrganizerData}>Try Again</Button>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {organizer?.organizationName}</p>
            </div>
            <Button onClick={handleCreateEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{events.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {events.filter((e) => e.status === "published").length} published
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Tickets Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-xs text-gray-500 mt-1">Across all events</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0.00 ZMW</div>
                <p className="text-xs text-gray-500 mt-1">Across all events</p>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {events.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="mb-4 text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No Events Yet</h2>
                  <p className="text-gray-600 mb-6">Create your first event to get started</p>
                  <Button onClick={handleCreateEvent}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-48 h-32 sm:h-auto">
                            <div className="relative h-full w-full">
                              <Image
                                src={event.imageUrl || "/placeholder.svg?height=200&width=400&text=Event"}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(event.status)}
                                <span className="text-sm text-gray-500">{formatDate(event.startDate)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                              {event.description || "No description provided"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.id!)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/events/organizer/tickets/${event.id}`}>
                                  <BarChart3 className="mr-2 h-4 w-4" />
                                  Manage Tickets
                                </Link>
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Event</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete this event? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEventToDelete(null)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        setEventToDelete(event.id!)
                                        handleDeleteEvent()
                                      }}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? "Deleting..." : "Delete"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="published" className="mt-0">
              {/* Published events content */}
              <div className="text-center py-12">
                <p className="text-gray-500">Coming soon! Check back for published events.</p>
              </div>
            </TabsContent>

            <TabsContent value="draft" className="mt-0">
              {/* Draft events content */}
              <div className="text-center py-12">
                <p className="text-gray-500">Coming soon! Check back for draft events.</p>
              </div>
            </TabsContent>

            <TabsContent value="past" className="mt-0">
              {/* Past events content */}
              <div className="text-center py-12">
                <p className="text-gray-500">Coming soon! Check back for past events.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
