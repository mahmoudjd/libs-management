import type { ComponentType, SVGProps } from "react"
import {
  BookOpenIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export type NavigationItem = {
  href: string
  label: string
  Icon: IconComponent
  requiresSession?: boolean
  staffOnly?: boolean
  adminOnly?: boolean
}

type GetNavigationItemsOptions = {
  isAuthenticated: boolean
  isAdmin: boolean
  isStaff: boolean
}

const baseItems: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { href: "/books", label: "Books", Icon: BookOpenIcon },
]

const protectedItems: NavigationItem[] = [
  { href: "/loans", label: "Loans", Icon: ClipboardDocumentListIcon, requiresSession: true },
  { href: "/reservations", label: "Reservations", Icon: BookmarkIcon, staffOnly: true },
  { href: "/users", label: "Users", Icon: UsersIcon, adminOnly: true },
  { href: "/audit-logs", label: "Audit", Icon: ShieldCheckIcon, adminOnly: true },
  { href: "/profile", label: "Profile", Icon: UserCircleIcon, requiresSession: true },
]

export function getNavigationItems({
  isAuthenticated,
  isAdmin,
  isStaff,
}: GetNavigationItemsOptions) {
  const loansLabel = isStaff ? "All Loans" : "My Loans"

  const items = [...baseItems, ...protectedItems].map((item) => {
    if (item.href === "/loans") {
      return {
        ...item,
        label: loansLabel,
      }
    }

    return item
  })

  return items.filter((item) => {
    if (item.requiresSession && !isAuthenticated) {
      return false
    }

    if (item.staffOnly && !isStaff) {
      return false
    }

    if (item.adminOnly && !isAdmin) {
      return false
    }

    return true
  })
}

/** Marks /books active on /books/anything, but never matches /books from /bookshelf. */
export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
