"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/app/components/theme-toggle"
import { Logo } from "@/app/components/logo"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
        isScrolled ? "bg-white/95 shadow-sm dark:bg-gray-900/95" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size="medium" />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/") ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
          >
            Home
          </Link>
          <Link
            href="/events"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/events") ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
          >
            Events
          </Link>
          <Link
            href="/how-it-works"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/how-it-works") ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
          >
            How It Works
          </Link>
          <Link
            href="/fees"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/fees") ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
          >
            Fees
          </Link>
          <ThemeToggle />
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-all"
              >
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-sm hover:shadow-md transition-all"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="container md:hidden py-4 space-y-4">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/") ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/events"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/events") ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/how-it-works") ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/fees"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/fees") ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Fees
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
            <div className="flex flex-col space-y-2">
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-all"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-sm hover:shadow-md transition-all">
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
