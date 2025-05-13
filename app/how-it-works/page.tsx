import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import Header from "../components/header"

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white pt-16 md:pt-20 lg:pt-28">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How Funacash Works</h1>
              <p className="text-gray-500 md:text-xl/relaxed">
                Send money between Zambia and Zimbabwe quickly, securely, and with the lowest fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Step 1</div>
                <h2 className="text-3xl font-bold">Create Your Account</h2>
                <p className="text-gray-500 md:text-lg">
                  Sign up for a free Funacash account in minutes. All you need is your basic information and a valid ID
                  document for verification.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Quick and easy registration process</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Secure identity verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Available for both individuals and businesses</span>
                  </li>
                </ul>
                <Button className="mt-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white" asChild>
                  <Link href="/auth/signup">
                    Create Account
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-full max-w-[400px] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&text=Create+Account"
                  alt="Create account"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-gradient-to-br from-blue-50 to-white py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div className="flex items-center justify-center order-last md:order-first">
              <div className="relative h-[300px] w-full max-w-[400px] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&text=Send+Money"
                  alt="Send money"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Step 2</div>
                <h2 className="text-3xl font-bold">Send Money</h2>
                <p className="text-gray-500 md:text-lg">
                  Choose how much you want to send, select your recipient, and complete the payment. We offer multiple
                  convenient payment methods.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Competitive exchange rates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Low transaction fees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Multiple payment options</span>
                  </li>
                </ul>
                <Button className="mt-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white" asChild>
                  <Link href="#">
                    Send Money
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Step 3</div>
                <h2 className="text-3xl font-bold">Receive Money</h2>
                <p className="text-gray-500 md:text-lg">
                  Your recipient receives the money quickly and securely. They can choose to receive it directly into
                  their bank account or mobile money wallet.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Fast and secure transfers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Direct to bank or mobile money</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span>Real-time notifications</span>
                  </li>
                </ul>
                <Button className="mt-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white" asChild>
                  <Link href="#">
                    Track Transfer
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-full max-w-[400px] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&text=Receive+Money"
                  alt="Receive money"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
