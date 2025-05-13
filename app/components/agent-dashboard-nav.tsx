"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart3, Users, FileText, User, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    name: "Home",
    href: "/dashboard/agent",
    icon: Home,
  },
  {
    name: "Transactions",
    href: "/dashboard/agent/transactions",
    icon: BarChart3,
  },
  {
    name: "Customers",
    href: "/dashboard/agent/customers",
    icon: Users,
  },
  {
    name: "Reports",
    href: "/dashboard/agent/reports",
    icon: FileText,
  },
  {
    name: "Profile",
    href: "/dashboard/agent/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/dashboard/agent/settings",
    icon: Settings,
  },
]

export function AgentDashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "justify-start",
            pathname === item.href && "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700",
          )}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
