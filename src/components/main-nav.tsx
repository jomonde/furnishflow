import Link from "next/link"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: keyof typeof Icons
  disabled?: boolean
}

export function MainNav() {
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Clients",
      href: "/clients",
      icon: "clients",
    },
    {
      title: "Sales",
      href: "/sales",
      icon: "invoices",
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: "calendar",
    },
    {
      title: "Follow-Ups",
      href: "/follow-ups",
      icon: "invoices",
    },
    {
      title: "Sketch Maker",
      href: "/sketch-maker",
      icon: "products",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      {navItems.map((item) => {
        if (item.href === "/dashboard") return null
        const Icon = Icons[item.icon] || Icons.logo
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              item.disabled && "cursor-not-allowed opacity-80"
            )}
          >
            <div className="flex items-center space-x-2">
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
