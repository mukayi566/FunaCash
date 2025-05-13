"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    id: 1,
    name: "Chipo Mulenga",
    location: "Lusaka, Zambia",
    image: "/placeholder.svg?height=80&width=80&text=CM",
    quote:
      "Funacash has been a lifesaver for sending money to my family in Zimbabwe. The process is quick, and the fees are much lower than what I was paying before.",
    rating: 5,
  },
  {
    id: 2,
    name: "Tendai Moyo",
    location: "Harare, Zimbabwe",
    image: "/placeholder.svg?height=80&width=80&text=TM",
    quote:
      "I receive money from my son in Zambia every month through Funacash. The money arrives within minutes, and the exchange rates are very competitive.",
    rating: 5,
  },
  {
    id: 3,
    name: "David Banda",
    location: "Kitwe, Zambia",
    image: "/placeholder.svg?height=80&width=80&text=DB",
    quote:
      "I've tried several money transfer services, but Funacash offers the best combination of speed, security, and low fees for sending money to Zimbabwe.",
    rating: 4,
  },
  {
    id: 4,
    name: "Grace Ncube",
    location: "Bulawayo, Zimbabwe",
    image: "/placeholder.svg?height=80&width=80&text=GN",
    quote:
      "The Funacash app is so easy to use! I can track my transfers in real-time and always know when my money will arrive. Highly recommended!",
    rating: 5,
  },
]

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToPrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  useEffect(() => {
    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
      <div className="absolute right-8 top-8 flex space-x-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-blue-200 hover:bg-blue-50 transition-all"
          onClick={goToPrev}
          disabled={isAnimating}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-blue-200 hover:bg-blue-50 transition-all"
          onClick={goToNext}
          disabled={isAnimating}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      {/* Large quote icon */}
      <div className="absolute -left-4 top-4 text-blue-100">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 11H6C5.46957 11 4.96086 10.7893 4.58579 10.4142C4.21071 10.0391 4 9.53043 4 9V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H8C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7V15C10 16.0609 9.57857 17.0783 8.82843 17.8284C8.07828 18.5786 7.06087 19 6 19H5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 11H16C15.4696 11 14.9609 10.7893 14.5858 10.4142C14.2107 10.0391 14 9.53043 14 9V7C14 6.46957 14.2107 5.96086 14.5858 5.58579C14.9609 5.21071 15.4696 5 16 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7V15C20 16.0609 19.5786 17.0783 18.8284 17.8284C18.0783 18.5786 17.0609 19 16 19H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="relative h-[350px] overflow-hidden">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={cn(
              "absolute inset-0 flex flex-col transition-all duration-500 ease-in-out",
              index === activeIndex
                ? "translate-x-0 opacity-100"
                : index < activeIndex
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0",
            )}
          >
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-6 w-6",
                        i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200",
                      )}
                    />
                  ))}
                </div>
                <blockquote className="text-xl font-medium text-gray-700 md:text-2xl leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </div>
              <div className="mt-8 flex items-center space-x-4">
                <div className="h-14 w-14 overflow-hidden rounded-full ring-4 ring-blue-50">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              index === activeIndex ? "bg-blue-600 w-8" : "bg-gray-300 w-2.5 hover:bg-gray-400",
            )}
            onClick={() => {
              if (isAnimating) return
              setIsAnimating(true)
              setActiveIndex(index)
              setTimeout(() => setIsAnimating(false), 500)
            }}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
