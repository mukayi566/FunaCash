"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Check, ArrowDownUp } from "lucide-react"
import { fetchExchangeRate, convertAmount, getAvailableCurrencies } from "@/app/actions/exchange-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface Currency {
  code: string
  name: string
  flag: string
}

export default function ExchangePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true)
  const [rate, setRate] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [fromAmount, setFromAmount] = useState<string>("100")
  const [toAmount, setToAmount] = useState<string>("")
  const [fromCurrency, setFromCurrency] = useState<string>("ZWL")
  const [toCurrency, setToCurrency] = useState<string>("ZMW")
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([])
  const [rateSource, setRateSource] = useState<string>("XE Currency Data")

  useEffect(() => {
    loadCurrencies()
  }, [])

  useEffect(() => {
    if (fromCurrency && toCurrency) {
      fetchRate()
    }
  }, [fromCurrency, toCurrency])

  const loadCurrencies = async () => {
    setIsLoadingCurrencies(true)
    try {
      const result = await getAvailableCurrencies()
      if (result.success) {
        setAvailableCurrencies(result.currencies)
      }
    } catch (error) {
      console.error("Error loading currencies:", error)
    } finally {
      setIsLoadingCurrencies(false)
    }
  }

  const fetchRate = async () => {
    setIsLoading(true)
    try {
      const result = await fetchExchangeRate(fromCurrency, toCurrency)

      if (result.success) {
        setRate(Number.parseFloat(result.rate))
        setLastUpdated(result.lastUpdated)
        setRateSource(result.source || "XE Currency Data")

        // Update the conversion if we have an amount
        if (fromAmount) {
          const converted = await convertAmount(Number.parseFloat(fromAmount), Number.parseFloat(result.rate))
          setToAmount(converted.toFixed(2))
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch exchange rate",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching rate:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching the exchange rate",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value)

    if (value && !isNaN(Number.parseFloat(value)) && rate) {
      const converted = await convertAmount(Number.parseFloat(value), rate)
      setToAmount(converted.toFixed(2))
    } else {
      setToAmount("")
    }
  }

  const handleToAmountChange = async (value: string) => {
    setToAmount(value)

    if (value && !isNaN(Number.parseFloat(value)) && rate) {
      const converted = await convertAmount(Number.parseFloat(value), rate, true)
      setFromAmount(converted.toFixed(2))
    } else {
      setFromAmount("")
    }
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get currency object by code
  const getCurrencyByCode = (code: string): Currency | undefined => {
    return availableCurrencies.find((currency) => currency.code === code)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-4xl">
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
            <CardTitle>Currency Exchange</CardTitle>
            <CardDescription>Convert between currencies at the best rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="convert" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="convert">Convert</TabsTrigger>
                <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
              </TabsList>
              <TabsContent value="convert" className="space-y-6 pt-4">
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>From Currency</Label>
                      <select
                        className="w-full rounded-md border border-gray-300 p-2"
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                        disabled={isLoadingCurrencies}
                      >
                        {isLoadingCurrencies ? (
                          <option>Loading currencies...</option>
                        ) : (
                          availableCurrencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.flag} {currency.code} - {currency.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="relative space-y-2">
                      <Label>To Currency</Label>
                      <div className="flex items-center gap-2">
                        <select
                          className="w-full rounded-md border border-gray-300 p-2"
                          value={toCurrency}
                          onChange={(e) => setToCurrency(e.target.value)}
                          disabled={isLoadingCurrencies}
                        >
                          {isLoadingCurrencies ? (
                            <option>Loading currencies...</option>
                          ) : (
                            availableCurrencies.map((currency) => (
                              <option key={currency.code} value={currency.code}>
                                {currency.flag} {currency.code} - {currency.name}
                              </option>
                            ))
                          )}
                        </select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={swapCurrencies}
                          className="flex-shrink-0"
                          disabled={isLoading || isLoadingCurrencies}
                        >
                          <ArrowDownUp className="h-4 w-4" />
                          <span className="sr-only">Swap currencies</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Exchange Rate</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchRate}
                        disabled={isLoading}
                        className="h-8 px-2 text-xs"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Refresh
                      </Button>
                    </div>
                    <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                      {isLoading ? (
                        <div className="animate-pulse w-full h-4 bg-gray-200 rounded"></div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span>
                            1 {fromCurrency} = {rate ? rate.toFixed(4) : "..."} {toCurrency}
                          </span>
                          <span className="text-xs text-gray-500">
                            {lastUpdated ? `Updated: ${formatDate(lastUpdated)}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Source: {rateSource}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fromAmount">
                        {getCurrencyByCode(fromCurrency)?.flag} {fromCurrency} Amount
                      </Label>
                      <Input
                        id="fromAmount"
                        type="number"
                        placeholder="Enter amount"
                        value={fromAmount}
                        onChange={(e) => handleFromAmountChange(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toAmount">
                        {getCurrencyByCode(toCurrency)?.flag} {toCurrency} Amount
                      </Label>
                      <Input
                        id="toAmount"
                        type="number"
                        placeholder="Converted amount"
                        value={toAmount}
                        onChange={(e) => handleToAmountChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700">Exchange Currency</Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="rates" className="pt-4">
                <div className="space-y-4">
                  <div className="rounded-lg border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Currency Pair
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Rate
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Last Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-4">
                              <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">🇿🇼</span>
                                  <span>ZWL → ZMW</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{rate ? rate.toFixed(4) : "Loading..."}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lastUpdated ? formatDate(lastUpdated) : "Loading..."}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">🇿🇲</span>
                                  <span>ZMW → ZWL</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {rate ? (1 / rate).toFixed(4) : "Loading..."}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lastUpdated ? formatDate(lastUpdated) : "Loading..."}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">🇺🇸</span>
                                  <span>USD → ZMW</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">25.6721</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lastUpdated ? formatDate(lastUpdated) : "Loading..."}
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-500">
                    Note: These rates are updated in real-time from XE Currency Data. Actual transaction rates may vary
                    slightly.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Exchange Benefits</CardTitle>
              <CardDescription>Why exchange with Funacash</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Competitive Rates</h4>
                    <p className="text-sm text-gray-500">
                      Our rates are consistently better than traditional banks and other services.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">No Hidden Fees</h4>
                    <p className="text-sm text-gray-500">
                      We're transparent about our fees, with no surprises or hidden charges.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Instant Exchanges</h4>
                    <p className="text-sm text-gray-500">Exchange currencies instantly with no waiting periods.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exchange History</CardTitle>
              <CardDescription>Your recent currency exchanges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No exchange history yet</p>
                <p className="text-sm mt-2">Your recent exchanges will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
