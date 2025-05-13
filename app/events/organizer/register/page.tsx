"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createEventOrganizer } from "@/lib/event-service"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { useToast } from "@/hooks/use-toast"

export default function OrganizerRegistrationPage() {
  const [organizationName, setOrganizationName] = useState("")
  const [description, setDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
          description: "Please log in to register as an organizer",
          variant: "destructive",
        })

        // Redirect to login
        router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      const result = await createEventOrganizer({
        userId,
        organizationName,
        description,
        website,
        email,
        phone,
      })

      if (result.success) {
        setIsSuccess(true)
        toast({
          title: "Registration successful",
          description: "Your organizer account has been created",
        })
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Please try again later",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error registering organizer:", error)
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 mx-auto">
          {isSuccess ? (
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6 text-green-500">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Registration Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your organizer account has been created. You can now start creating and managing events.
              </p>
              <Button asChild>
                <Link href="/events/organizer/dashboard">Go to Organizer Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Become an Event Organizer</h1>
                <p className="text-gray-600">
                  Register as an event organizer to create and manage events on Funacash Events
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organizer Information</CardTitle>
                      <CardDescription>Fill in the details about your organization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="organizationName">Organization Name</Label>
                          <Input
                            id="organizationName"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website (Optional)</Label>
                          <Input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Contact Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Contact Phone</Label>
                          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Register as Organizer"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Benefits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Create Events</h3>
                          <p className="text-sm text-gray-500">
                            Create and manage your events with our easy-to-use platform
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Reach Customers</h3>
                          <p className="text-sm text-gray-500">
                            Connect with thousands of potential attendees across Zambia
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Secure Payments</h3>
                          <p className="text-sm text-gray-500">
                            Receive payments securely through Funacash's trusted platform
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-gray-500">
                        Already registered?{" "}
                        <Link href="/events/organizer/dashboard" className="text-blue-600 hover:underline">
                          Sign in
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
