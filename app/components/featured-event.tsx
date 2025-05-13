import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Event {
  id: string
  title: string
  description: string
  location: string
  startDate: any
  endDate: any
  imageUrl?: string
  ticketPrice: number
  currency: string
  status: string
}

interface FeaturedEventProps {
  event: Event
}

export function FeaturedEvent({ event }: FeaturedEventProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {event.imageUrl ? (
          <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-100">
            <Ticket className="h-16 w-16 text-blue-500" />
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold">{event.title}</h3>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
            <span>
              {formatDate(event.startDate)}
              {event.endDate && event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-blue-500" />
            <span>{event.location}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ticket Price</p>
              <p className="text-lg font-bold">
                {event.ticketPrice} {event.currency}
              </p>
            </div>
            <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              {event.status === "active" ? "Available" : event.status}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-4">
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>View Event Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
