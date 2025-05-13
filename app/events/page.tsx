"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, MapPin, Tag, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getEvents } from "@/lib/event-service"
import type { Event } from "@/lib/models/event-models"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const category = searchParams.get("category") || ""
    const city = searchParams.get("city") || ""

    setSelectedCategory(category)
    setSelectedCity(city)

    fetchEvents(category, city)
    fetchFeaturedEvents()
  }, [searchParams])

  const fetchEvents = async (category: string, city: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const options: any = {
        limit: 12,
        status: "published",
      }

      if (category) {
        options.category = category
      }

      if (city) {
        options.city = city
      }

      const result = await getEvents(options)

      if (result.success) {
        setEvents(result.events)
        setLastDoc(result.lastDoc)
        setHasMore(result.hasMore)
      } else {
        setError(result.error || "Failed to fetch events")
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("An error occurred while fetching events")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFeaturedEvents = async () => {
    try {
      // For featured events, we'll use a simpler query approach
      const result = await getEvents({
        limit: 5,
        featured: true,
        status: "published",
      })

      if (result.success) {
        setFeaturedEvents(result.events)
      }
    } catch (error) {
      console.error("Error fetching featured events:", error)
    }
  }

  const loadMoreEvents = async () => {
    if (!lastDoc) return

    try {
      setIsLoading(true)

      const options: any = {
        limit: 12,
        status: "published",
        startAfter: lastDoc,
      }

      if (selectedCategory) {
        options.category = selectedCategory
      }

      if (selectedCity) {
        options.city = selectedCity
      }

      const result = await getEvents(options)

      if (result.success) {
        setEvents((prev) => [...prev, ...result.events])
        setLastDoc(result.lastDoc)
        setHasMore(result.hasMore)
      }
    } catch (error) {
      console.error("Error loading more events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    updateFilters(value, selectedCity)
  }

  const handleCityChange = (value: string) => {
    setSelectedCity(value)
    updateFilters(selectedCategory, value)
  }

  const updateFilters = (category: string, city: string) => {
    const params = new URLSearchParams()

    if (category) {
      params.set("category", category)
    }

    if (city) {
      params.set("city", city)
    }

    router.push(`/events?${params.toString()}`)
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 md:py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Discover Events in Zambia</h1>
              <p className="text-blue-100 text-lg mb-8">Find and book tickets for the best events happening near you</p>

              <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input type="text" placeholder="Search events..." className="pl-10 h-12 w-full" />
                </div>
                <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700">Search</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container px-4 md:px-6 mx-auto">
              <h2 className="text-2xl font-bold mb-6">Featured Events</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.slice(0, 3).map((event) => (
                  <Link href={`/events/${event.id}`} key={event.id} className="block group">
                    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={event.imageUrl || "/placeholder.svg?height=200&width=400&text=Event"}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-blue-600">Featured</Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {event.location}, {event.city}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <div className="flex items-center text-sm">
                          <Tag className="h-4 w-4 mr-1 text-blue-600" />
                          <span className="text-blue-600">{event.category}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Events */}
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold">All Events</h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Filter by:</span>
                </div>

                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="arts">Arts & Culture</SelectItem>
                    <SelectItem value="food">Food & Drink</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCity} onValueChange={handleCityChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="lusaka">Lusaka</SelectItem>
                    <SelectItem value="ndola">Ndola</SelectItem>
                    <SelectItem value="kitwe">Kitwe</SelectItem>
                    <SelectItem value="livingstone">Livingstone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="upcoming">
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="weekend">This Weekend</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-0">
                {error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                    <Button
                      variant="outline"
                      onClick={() => fetchEvents(selectedCategory, selectedCity)}
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : isLoading && events.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(8)
                      .fill(0)
                      .map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                          <Skeleton className="h-48 w-full" />
                          <CardContent className="p-4">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No events found. Try adjusting your filters.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {events.map((event) => (
                        <Link href={`/events/${event.id}`} key={event.id} className="block group">
                          <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
                            <div className="relative h-48 w-full overflow-hidden">
                              <Image
                                src={event.imageUrl || "/placeholder.svg?height=200&width=400&text=Event"}
                                alt={event.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{formatDate(event.startDate)}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>
                                  {event.location}, {event.city}
                                </span>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                              <div className="flex items-center text-sm">
                                <Tag className="h-4 w-4 mr-1 text-blue-600" />
                                <span className="text-blue-600">{event.category}</span>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    {hasMore && (
                      <div className="flex justify-center mt-8">
                        <Button variant="outline" onClick={loadMoreEvents} disabled={isLoading}>
                          {isLoading ? "Loading..." : "Load More"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="weekend" className="mt-0">
                {/* Weekend events content */}
                <div className="text-center py-12">
                  <p className="text-gray-500">Coming soon! Check back for weekend events.</p>
                </div>
              </TabsContent>

              <TabsContent value="month" className="mt-0">
                {/* Monthly events content */}
                <div className="text-center py-12">
                  <p className="text-gray-500">Coming soon! Check back for monthly events.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Become an Organizer */}
        <section className="bg-blue-50 py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-4">Organize Your Own Event</h2>
                <p className="text-gray-600 mb-6">
                  Are you planning an event in Zambia? List it on Funacash Events and reach thousands of potential
                  attendees. Our platform provides powerful tools for event management, ticket sales, and promotion.
                </p>
                <Button asChild>
                  <Link href="/events/organizer/register">Become an Organizer</Link>
                </Button>
              </div>
              <div className="md:w-1/2">
                <Image
                  src="/placeholder.svg?height=300&width=500&text=Event+Management"
                  alt="Event Management"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
