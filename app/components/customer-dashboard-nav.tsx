"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Send, Plus, BarChart3, RefreshCw, User, Settings, MessageCircle, Gift, Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function CustomerDashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard/customer",
      label: "Home",
      icon: Home,
      exact: true,
    },
    {
      href: "/dashboard/customer/send",
      label: "Send Money",
      icon: Send,
    },
    {
      href: "/dashboard/customer/send-whatsapp",
      label: "Send via WhatsApp",
      icon: MessageCircle,
    },
    {
      href: "/dashboard/customer/add-money",
      label: "Add Money",
      icon: Plus,
    },
    {
      href: "/dashboard/customer/transactions",
      label: "Transactions",
      icon: BarChart3,
    },
    {
      href: "/dashboard/customer/exchange",
      label: "Exchange",
      icon: RefreshCw,
    },
    {
      href: "/dashboard/customer/referrals",
      label: "Referrals",
      icon: Gift,
    },
    {
      href: "/dashboard/customer/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      href: "/dashboard/customer/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/dashboard/customer/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="flex flex-col gap-2">
      {routes.map((route) => (
        <Button
          key={route.href}
          variant="ghost"
          className={cn(
            "justify-start",
            (route.exact ? pathname === route.href : pathname.startsWith(route.href)) &&
              "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800",
          )}
          asChild
        >
          <Link href={route.href}>
            <route.icon className="mr-2 h-4 w-4" />
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
