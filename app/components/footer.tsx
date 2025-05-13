import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { Logo } from "@/app/components/logo"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white dark:bg-gray-900 dark:border-gray-800 py-16">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Logo size="large" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left leading-relaxed">
              Fast and secure money transfers between Zambia and Zimbabwe. Send money to your loved ones with the lowest
              fees and best exchange rates.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Company</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "About Us", path: "/about" },
                { name: "Careers", path: "/careers" },
                { name: "Press", path: "/press" },
                { name: "News", path: "/news" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Services</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Money Transfer", path: "/money-transfer" },
                { name: "Exchange Rates", path: "/exchange-rates" },
                { name: "Business Solutions", path: "/business-solutions" },
                { name: "Mobile App", path: "/mobile-app" },
                { name: "Refer a Friend", path: "/refer-a-friend" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Support</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Help Center", path: "/help-center" },
                { name: "FAQs", path: "/faqs" },
                { name: "Transaction Status", path: "/transaction-status" },
                { name: "Safety Tips", path: "/safety-tips" },
                { name: "Privacy Policy", path: "/privacy-policy" },
                { name: "Terms of Service", path: "/terms-of-service" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t dark:border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Funacash. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="#"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
