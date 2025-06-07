"use client"

import { useState } from "react"
import { Users, ArrowRightLeft, Globe } from "lucide-react"
import { AnimatedCounter } from "./animated-counter"

// Use hardcoded values instead of fetching from Firebase
const FALLBACK_CUSTOMER_COUNT = 500
const FALLBACK_TRANSACTION_COUNT = 1200
const FALLBACK_COUNTRIES_COUNT = 2

export function StatsSection() {
  const [customerCount, setCustomerCount] = useState(FALLBACK_CUSTOMER_COUNT)
  const [transactionCount, setTransactionCount] = useState(FALLBACK_TRANSACTION_COUNT)
  const [countriesCount, setCountriesCount] = useState(FALLBACK_COUNTRIES_COUNT)
  const [isLoading, setIsLoading] = useState(false)

  // No network requests in this component anymore

  return (
    <section className="w-full py-12 md:py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium">
              Our Impact
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
              Funacash by the Numbers
            </h2>
            <p className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mx-auto">
              Trusted for cross-border money transfers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-all hover:shadow-md">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <AnimatedCounter endValue={customerCount} title="Registered Customers" suffix="+" className="mb-2" />
            <p className="text-gray-600 text-sm">Trusted by customers across Africa</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-all hover:shadow-md">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ArrowRightLeft className="h-6 w-6 text-blue-700" />
            </div>
            <AnimatedCounter endValue={transactionCount} title="Successful Transfers" suffix="+" className="mb-2" />
            <p className="text-gray-600 text-sm">Fast and secure money transfers</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-all hover:shadow-md">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-blue-700" />
            </div>
            <AnimatedCounter endValue={countriesCount} title="Countries Served" className="mb-2" />
            <p className="text-gray-600 text-sm">Connecting Zambia and Zimbabwe</p>
          </div>
        </div>
      </div>
    </section>
  )
}
