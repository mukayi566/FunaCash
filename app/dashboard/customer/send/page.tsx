"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, ChevronDown, Globe, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createTransaction } from "@/lib/db-service"
import { firebaseDb } from "@/lib/firebase"
import { Textarea } from "@/components/ui/textarea"

const countries = [
  {
    value: "zambia",
    label: "Zambia",
    flag: "🇿🇲",
    currency: "ZMW",
  },
  {
    value: "zimbabwe",
    label: "Zimbabwe",
    flag: "🇿🇼",
    currency: "ZWL",
  },
]

const recentRecipients = [
  {
    id: "r1",
    name: "Grace Moyo",
    phone: "+263 71 234 5678",
    country: "Zimbabwe",
  },
  {
    id: "r2",
    name: "Tendai Ncube",
    phone: "+263 77 876 5432",
    country: "Zimbabwe",
  },
  {
    id: "r3",
    name: "Chipo Mulenga",
    phone: "+263 73 456 7890",
    country: "Zimbabwe",
  },
]

export default function SendMoneyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [fromCountry, setFromCountry] = useState(countries[0])
  const [toCountry, setToCountry] = useState(countries[1])
  const [amount, setAmount] = useState("")
  const [convertedAmount, setConvertedAmount] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [note, setNote] = useState("")
  const [openFromCountry, setOpenFromCountry] = useState(false)
  const [openToCountry, setOpenToCountry] = useState(false)

  const handleAmountChange = (value) => {
    setAmount(value)
    // Simple conversion for demo purposes
    const numericValue = Number.parseFloat(value.replace(/,/g, "")) || 0
    setConvertedAmount((numericValue * 0.95).toFixed(2))
  }

  const handleSelectRecipient = (recipient) => {
    setSelectedRecipient(recipient)
    setRecipientName(recipient.name)
    setRecipientPhone(recipient.phone)
  }

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

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

      // Create transaction data
      const transactionData = {
        senderId: userId,
        recipientName,
        recipientPhone,
        amount: Number.parseFloat(amount),
        currency: fromCountry.currency,
        type: "send",
      }

      // Call createTransaction function
      const result = await createTransaction(firebaseDb, transactionData)

      if (result.success) {
        toast({
          title: "Transfer initiated",
          description: "Your money transfer has been initiated successfully",
        })

        router.push("/dashboard/customer")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to initiate transfer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during transfer:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-md">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Send Money</CardTitle>
            <CardDescription>
              {step === 1 && "Choose countries and enter amount"}
              {step === 2 && "Select or add recipient"}
              {step === 3 && "Review and confirm your transfer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Popover open={openFromCountry} onOpenChange={setOpenFromCountry}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openFromCountry}
                        className="w-full justify-between"
                      >
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{fromCountry.flag}</span>
                          <span>{fromCountry.label}</span>
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.value}
                                value={country.value}
                                onSelect={() => {
                                  setFromCountry(country)
                                  setOpenFromCountry(false)
                                }}
                              >
                                <div className="flex items-center">
                                  <span className="mr-2 text-xl">{country.flag}</span>
                                  <span>{country.label}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    fromCountry.value === country.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>To</Label>
                  <Popover open={openToCountry} onOpenChange={setOpenToCountry}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openToCountry}
                        className="w-full justify-between"
                      >
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{toCountry.flag}</span>
                          <span>{toCountry.label}</span>
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.value}
                                value={country.value}
                                onSelect={() => {
                                  setToCountry(country)
                                  setOpenToCountry(false)
                                }}
                              >
                                <div className="flex items-center">
                                  <span className="mr-2 text-xl">{country.flag}</span>
                                  <span>{country.label}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    toCountry.value === country.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">You send</Label>
                    <span className="text-xs text-gray-500">Available: 2,500 ZMW</span>
                  </div>
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <Input
                      id="amount"
                      type="text"
                      placeholder="0.00"
                      className="border-0"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                    />
                    <div className="px-3 text-gray-500">{fromCountry.currency}</div>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <RefreshCw className="h-4 w-4" />
                    <span>
                      1 {fromCountry.currency} = 0.95 {toCountry.currency}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>They receive</Label>
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <Input type="text" placeholder="0.00" className="border-0" value={convertedAmount} readOnly />
                    <div className="px-3 text-gray-500">{toCountry.currency}</div>
                  </div>
                </div>

                <div className="rounded-md bg-blue-50 p-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium">Transfer Details</p>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Transfer fee:</span>
                      <span>10.00 {fromCountry.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exchange rate:</span>
                      <span>
                        1 {fromCountry.currency} = 0.95 {toCountry.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated arrival:</span>
                      <span>Within minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Tabs defaultValue="recent" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="new">New Recipient</TabsTrigger>
                  </TabsList>
                  <TabsContent value="recent" className="space-y-4 pt-4">
                    {recentRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedRecipient?.id === recipient.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelectRecipient(recipient)}
                      >
                        <div>
                          <div className="font-medium">{recipient.name}</div>
                          <div className="text-xs text-gray-500">{recipient.phone}</div>
                          <div className="text-xs text-gray-500">{recipient.country}</div>
                        </div>
                        {selectedRecipient?.id === recipient.id && <Check className="h-5 w-5 text-blue-500" />}
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="new" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input
                        id="recipientName"
                        placeholder="Enter recipient's full name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipientPhone">Recipient Phone Number</Label>
                      <Input
                        id="recipientPhone"
                        placeholder="e.g. +263 71 234 5678"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Enter the phone number with country code</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add a message to the recipient"
                    className="resize-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">From</span>
                    <div className="flex items-center">
                      <span className="mr-2 text-base">{fromCountry.flag}</span>
                      <span className="font-medium">{fromCountry.label}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">To</span>
                    <div className="flex items-center">
                      <span className="mr-2 text-base">{toCountry.flag}</span>
                      <span className="font-medium">{toCountry.label}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">You send</span>
                    <span className="font-medium">
                      {amount} {fromCountry.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">They receive</span>
                    <span className="font-medium">
                      {convertedAmount} {toCountry.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Fee</span>
                    <span className="font-medium">10.00 {fromCountry.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-medium">
                      {(Number.parseFloat(amount.replace(/,/g, "")) + 10).toFixed(2)} {fromCountry.currency}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Recipient</span>
                    <span className="font-medium">{recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="font-medium">{recipientPhone}</span>
                  </div>
                  {note && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Note</span>
                      <span className="font-medium">{note}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-md bg-blue-50 p-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium">Transfer Information</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    Your money will be transferred immediately and the recipient will be notified via SMS.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700"
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1)
                } else {
                  handleContinue()
                }
              }}
              disabled={(step === 1 && !amount) || (step === 2 && (!recipientName || !recipientPhone)) || isLoading}
            >
              {isLoading ? (
                "Processing..."
              ) : step === 3 ? (
                "Confirm & Send"
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/customer">Cancel</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
