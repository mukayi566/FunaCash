import Image from "next/image"
import { ArrowRight, CheckCircle, ChevronRight, Globe, RefreshCw, Send, Star } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import TestimonialCarousel from "./components/testimonial-carousel"
import CountrySelector from "./components/country-selector"
import Header from "./components/header"
import Footer from "./components/footer"
import { StatsSection } from "./components/stats-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-16 md:pt-20 lg:pt-28">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center justify-center lg:justify-start space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-2 w-fit mx-auto lg:mx-0">
                <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
                <span>Fast & Reliable Service</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl md:text-6xl xl:text-7xl/none">
                  Fast & Secure Money Transfers Between{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Zambia & Zimbabwe
                  </span>
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl mx-auto lg:mx-0 leading-relaxed">
                  Send money to your loved ones quickly, securely, and with the lowest fees. Funacash makes cross-border
                  transfers simple and affordable.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:shadow-blue-200 transition-all"
                  asChild
                >
                  <Link href="/auth/signup">
                    Send Money Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-blue-200 hover:bg-blue-50 transition-all" asChild>
                  <Link href="/how-it-works">Learn More</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-4 justify-center lg:justify-start">
                <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Competitive Exchange Rates</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center mt-8 lg:mt-0">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-100 rounded-full blur-2xl opacity-70"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-70"></div>

                <div className="relative h-[450px] w-full max-w-[380px] overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl border border-gray-100 sm:p-8 z-10">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">Send Money</h3>
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">From</p>
                      <CountrySelector defaultCountry="Zambia" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">To</p>
                      <CountrySelector defaultCountry="Zimbabwe" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">You send</p>
                      <div className="flex items-center rounded-lg border border-gray-200 p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                        <input
                          type="text"
                          placeholder="1,000"
                          className="w-full border-none bg-transparent text-lg font-medium focus:outline-none"
                        />
                        <span className="text-gray-500 font-medium">ZMW</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">They receive</p>
                        <div className="flex items-center text-sm text-blue-700 font-medium">
                          <span>1 USD = 28.90 ZMW</span>
                        </div>
                      </div>
                      <div className="flex items-center rounded-lg border border-gray-200 bg-blue-50/50 p-3">
                        <input
                          type="text"
                          placeholder="34.60"
                          className="w-full border-none bg-transparent text-lg font-medium focus:outline-none"
                          readOnly
                        />
                        <span className="text-gray-500 font-medium">USD</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-md hover:shadow-lg transition-all"
                      asChild
                    >
                      <Link href="/auth/signup">
                        Continue
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium">
                Simple Process
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                How Funacash Works
              </h2>
              <p className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mx-auto">
                Send money between Zambia and Zimbabwe in just a few simple steps
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {[
              {
                icon: <Globe className="h-12 w-12 text-blue-600" />,
                title: "Choose Countries",
                description: "Select where you're sending from and to between Zambia and Zimbabwe",
              },
              {
                icon: <Send className="h-12 w-12 text-blue-600" />,
                title: "Enter Amount",
                description: "Input how much you want to send and see our competitive exchange rates",
              },
              {
                icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
                title: "Complete Transfer",
                description: "Finalize your transfer and the recipient gets funds within minutes",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center space-y-5 rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 transition-colors group-hover:bg-blue-100">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-blue-500 lg:block">
                  {index < 2 && <ArrowRight className="h-8 w-8" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium">
                Why Choose Us
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                The Funacash Advantage
              </h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed mx-auto lg:mx-0">
                We're committed to making money transfers between Zambia and Zimbabwe faster, safer, and more
                affordable.
              </p>
              <ul className="grid gap-4 mx-auto lg:mx-0 max-w-md">
                {[
                  "Lowest fees in the market",
                  "Instant transfers within minutes",
                  "Secure and compliant with regulations",
                  "Dedicated customer support",
                  "Transparent exchange rates",
                ].map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 justify-center lg:justify-start bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                  >
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
                  asChild
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <Button variant="outline" className="border-blue-200 hover:bg-blue-50 transition-all" asChild>
                  <Link href="/fees">Compare Rates</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center mt-8 lg:mt-0">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-70"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-70"></div>

                <Image
                  src="/placeholder.svg?height=500&width=500&text=Funacash+App"
                  width={500}
                  height={500}
                  alt="Funacash mobile app"
                  className="rounded-2xl shadow-xl max-w-full h-auto border-8 border-white relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                What Our Customers Say
              </h2>
              <p className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mx-auto">
                Our customers trust Funacash for their money transfers between Zambia and Zimbabwe
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-5xl py-12">
            <TestimonialCarousel />
          </div>
        </div>
      </section>

      {/* Exchange Rate Section - NEW */}
      <section className="w-full py-16 md:py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium">
                Current Rates
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                Today's Exchange Rates
              </h2>
              <p className="text-gray-600 md:text-xl/relaxed max-w-2xl mx-auto">
                We offer competitive exchange rates updated daily
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-all hover:shadow-md">
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-700">$</span>
                  </div>
                  <span className="font-semibold text-lg">USD to ZMW</span>
                </div>
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">28.90</div>
              <p className="text-sm text-gray-500">US Dollar to Zambian Kwacha</p>
              <div className="mt-4 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Updated today</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-all hover:shadow-md">
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-700">Z$</span>
                  </div>
                  <span className="font-semibold text-lg">ZWL to ZMW</span>
                </div>
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">0.95</div>
              <p className="text-sm text-gray-500">Zimbabwean Dollar to Zambian Kwacha</p>
              <div className="mt-4 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Updated today</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-all hover:shadow-md">
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-700">$</span>
                  </div>
                  <span className="font-semibold text-lg">USD to ZWL</span>
                </div>
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">30.42</div>
              <p className="text-sm text-gray-500">US Dollar to Zimbabwean Dollar</p>
              <div className="mt-4 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Updated today</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-blue-800 py-16 md:py-24 lg:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
                Ready to Send Money?
              </h2>
              <p className="text-blue-100 md:text-xl/relaxed max-w-2xl mx-auto">
                Join our satisfied customers who trust Funacash for their money transfers
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href="/auth/signup">
                  Send Money Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-blue-700 transition-all"
                asChild
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
