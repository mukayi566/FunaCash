"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, CreditCard, Plus, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export default function AddMoneyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [selectedCard, setSelectedCard] = useState("card1")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)

    toast({
      title: "Money added",
      description: `${amount} ZMW has been added to your account`,
    })

    router.push("/dashboard/customer")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-md">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/customer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add Money</CardTitle>
            <CardDescription>Add funds to your Funacash wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex items-center rounded-lg border border-gray-200">
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0.00"
                    className="border-0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <div className="px-3 text-gray-500">ZMW</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card">Card</TabsTrigger>
                    <TabsTrigger value="mobile">Mobile Money</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4 pt-4">
                    <RadioGroup value={selectedCard} onValueChange={setSelectedCard}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card1" id="card1" />
                          <Label htmlFor="card1" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-blue-500" />
                                <div>
                                  <div className="font-medium">Visa ending in 4242</div>
                                  <div className="text-xs text-gray-500">Expires 12/25</div>
                                </div>
                              </div>
                              {selectedCard === "card1" && <Check className="h-5 w-5 text-blue-500" />}
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card2" id="card2" />
                          <Label htmlFor="card2" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-blue-500" />
                                <div>
                                  <div className="font-medium">Mastercard ending in 5678</div>
                                  <div className="text-xs text-gray-500">Expires 09/24</div>
                                </div>
                              </div>
                              {selectedCard === "card2" && <Check className="h-5 w-5 text-blue-500" />}
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/customer/cards">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Card
                      </Link>
                    </Button>
                  </TabsContent>

                  <TabsContent value="mobile" className="space-y-4 pt-4">
                    <RadioGroup defaultValue="mtn">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mtn" id="mtn" />
                          <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <Wallet className="h-5 w-5 text-yellow-500" />
                                <div>
                                  <div className="font-medium">MTN Mobile Money</div>
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="airtel" id="airtel" />
                          <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <Wallet className="h-5 w-5 text-red-500" />
                                <div>
                                  <div className="font-medium">Airtel Money</div>
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input id="phoneNumber" placeholder="e.g. +260 97 123 4567" />
                      <p className="text-xs text-gray-500">
                        Enter the phone number linked to your mobile money account
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium">Transaction Information</p>
                </div>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Processing fee:</span>
                    <span>2.00 ZMW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total amount:</span>
                    <span>{amount ? (Number.parseFloat(amount.replace(/,/g, "")) + 2).toFixed(2) : "2.00"} ZMW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated processing time:</span>
                    <span>Instant</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700"
                disabled={!amount || isLoading}
              >
                {isLoading ? "Processing..." : "Add Money"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" asChild>
              <Link href="/dashboard/customer" className="text-sm text-gray-500">
                Cancel
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
