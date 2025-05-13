import Link from "next/link"
import { ArrowRight, CheckCircle, ChevronRight, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Header from "../components/header"

export default function FeesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white pt-16 md:pt-20 lg:pt-28">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Transparent Fees & Competitive Rates
              </h1>
              <p className="text-gray-500 md:text-xl/relaxed">
                We believe in complete transparency. Here's a breakdown of our fees and exchange rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fee Structure Section */}
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Fee Structure</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Simple Fee Structure</h2>
              <p className="text-gray-500 md:text-lg/relaxed">
                We keep our fees low and transparent so you know exactly what you're paying
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Standard Transfer</CardTitle>
                <CardDescription>For everyday money transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">2%</span>
                  <p className="text-sm text-gray-500">of transfer amount</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Processed within minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Multiple payout options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>No hidden charges</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-700" asChild>
                  <Link href="/auth/signup">
                    Send Money
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle>Business Transfer</CardTitle>
                <CardDescription>For business and high-volume transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">1.5%</span>
                  <p className="text-sm text-gray-500">of transfer amount</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Priority processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Bulk transfer options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Detailed reporting</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-700" asChild>
                  <Link href="/auth/signup">
                    Business Sign Up
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Economy Transfer</CardTitle>
                <CardDescription>For cost-conscious customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">1%</span>
                  <p className="text-sm text-gray-500">+ fixed fee of 10 ZMW</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Processed within 24 hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Limited payout options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Best for larger amounts</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-700" asChild>
                  <Link href="/auth/signup">
                    Send Money
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
              <Info className="h-5 w-5" />
              <p>For transfers above 5,000 ZMW, please contact our customer service for special rates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange Rates Section */}
      <section className="w-full bg-gradient-to-br from-blue-50 to-white py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Exchange Rates</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Current Exchange Rates</h2>
              <p className="text-gray-500 md:text-lg/relaxed">
                Our exchange rates are updated regularly to ensure you get the best value
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇿🇲</span>
                          <span>ZMW (Zambian Kwacha)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇿🇼</span>
                          <span>ZWL (Zimbabwean Dollar)</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">1 ZMW = 0.95 ZWL</TableCell>
                      <TableCell>Today, 10:30 AM</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇿🇼</span>
                          <span>ZWL (Zimbabwean Dollar)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇿🇲</span>
                          <span>ZMW (Zambian Kwacha)</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">1 ZWL = 1.05 ZMW</TableCell>
                      <TableCell>Today, 10:30 AM</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇺🇸</span>
                          <span>USD (US Dollar)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇿🇲</span>
                          <span>ZMW (Zambian Kwacha)</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">1 USD = 20.00 ZMW</TableCell>
                      <TableCell>Today, 10:30 AM</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇺🇸</span>
                          <span>USD (US Dollar)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇿🇼</span>
                          <span>ZWL (Zimbabwean Dollar)</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">1 USD = 19.00 ZWL</TableCell>
                      <TableCell>Today, 10:30 AM</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Rates are updated every hour. Last updated: May 20, 2023, 10:30 AM
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Fee Calculator Section */}
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Fee Calculator</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Calculate Your Transfer</h2>
              <p className="text-gray-500 md:text-lg/relaxed">
                Use our calculator to see exactly how much your recipient will get
              </p>
            </div>
          </div>

          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">You Send</label>
                    <div className="flex items-center rounded-lg border border-gray-200">
                      <input
                        type="text"
                        placeholder="1,000"
                        className="w-full border-none bg-transparent p-3 text-lg font-medium focus:outline-none"
                      />
                      <span className="px-3 text-gray-500">ZMW</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">They Receive</label>
                    <div className="flex items-center rounded-lg border border-gray-200">
                      <input
                        type="text"
                        placeholder="950"
                        className="w-full border-none bg-transparent p-3 text-lg font-medium focus:outline-none"
                        readOnly
                      />
                      <span className="px-3 text-gray-500">ZWL</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-blue-50 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Transfer fee (2%):</span>
                      <span className="font-medium">20.00 ZMW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Exchange rate:</span>
                      <span className="font-medium">1 ZMW = 0.95 ZWL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total to pay:</span>
                      <span className="font-medium">1,020.00 ZMW</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700" asChild>
                  <Link href="/auth/signup">
                    Send Money Now
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-blue-500 to-blue-700 py-12 md:py-20 lg:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-3 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
                Ready to Save on Fees?
              </h2>
              <p className="text-blue-100 md:text-xl/relaxed">
                Join thousands of satisfied customers who trust Funacash for their money transfers
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50" asChild>
                <Link href="/auth/signup">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-blue-100 text-white hover:bg-blue-600" asChild>
                <Link href="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
