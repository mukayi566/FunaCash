"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CreditCard, Home, Menu, PlusCircle, RefreshCw, Send, Settings, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { Logo } from "@/app/components/logo"

interface DashboardSidebarProps {
  userType: "customer" | "agent"
}

export function DashboardSidebar({ userType }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Close the sidebar when the route changes (for mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const customerLinks = [
    {
      href: "/dashboard/customer",
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/customer/send",
      icon: <Send className="h-5 w-5" />,
      label: "Send Money",
    },
    {
      href: "/dashboard/customer/add-money",
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Add Money",
    },
    {
      href: "/dashboard/customer/transactions",
      icon: <CreditCard className="h-5 w-5" />,
      label: "Transactions",
    },
    {
      href: "/dashboard/customer/exchange",
      icon: <RefreshCw className="h-5 w-5" />,
      label: "Exchange Rates",
    },
    {
      href: "/dashboard/customer/profile",
      icon: <User className="h-5 w-5" />,
      label: "Profile",
    },
    {
      href: "/dashboard/customer/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
    },
  ]

  const agentLinks = [
    {
      href: "/dashboard/agent",
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/agent/transactions",
      icon: <CreditCard className="h-5 w-5" />,
      label: "Transactions",
    },
    {
      href: "/dashboard/agent/customers",
      icon: <Users className="h-5 w-5" />,
      label: "Customers",
    },
    {
      href: "/dashboard/agent/reports",
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Reports",
    },
    {
      href: "/dashboard/agent/profile",
      icon: <User className="h-5 w-5" />,
      label: "Profile",
    },
    {
      href: "/dashboard/agent/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
    },
  ]

  const links = userType === "customer" ? customerLinks : agentLinks

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <Link
            href={userType === "customer" ? "/dashboard/customer" : "/dashboard/agent"}
            className="mb-2 flex h-10 items-center gap-2 rounded-md px-4"
          >
            <Logo size="medium" href={null} />
          </Link>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {userType === "customer" ? "Customer Portal" : "Agent Portal"}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-gray-500 dark:text-gray-400">
            {userType === "customer" ? "Manage Account" : "Manage Business"}
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b p-4 text-left">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden h-screen w-64 flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800 lg:flex">
        {sidebarContent}
      </div>
    </>
  )
}
