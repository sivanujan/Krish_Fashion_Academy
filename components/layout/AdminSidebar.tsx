"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  Image as ImageIcon,
  MessageSquareQuote,
  Inbox,
  HelpCircle,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const adminNav = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Batches", href: "/admin/batches", icon: Calendar },
  { name: "Courses", href: "/admin/courses", icon: GraduationCap },
  { name: "Recordings", href: "/admin/lessons", icon: BookOpen },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Enquiries", href: "/admin/enquiries", icon: Inbox },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquareQuote },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Site Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-charcoal-darkest border-r border-charcoal/80 flex flex-col justify-between h-screen sticky top-0 text-off-white select-none">
      <div className="overflow-y-auto">
        {/* Brand header */}
        <div className="p-6 border-b border-charcoal/60">
          <Link href="/admin">
            <div className="relative w-44 h-10">
              <Image
                src="/brand/KFA_logo_horizontal_transparent.png"
                alt="Krish Fashion Academy"
                width={176}
                height={40}
                className="object-contain"
              />
            </div>
          </Link>
          <span className="inline-block mt-2 text-[10px] uppercase tracking-[0.25em] text-gold-light bg-gold/15 border border-gold/30 px-2 py-0.5 rounded-sm">
            Academy Management
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {adminNav.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-medium transition-colors",
                  isActive
                    ? "bg-gold text-charcoal-darkest shadow-sm font-semibold"
                    : "text-off-white/80 hover:bg-charcoal/50 hover:text-gold-light"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-charcoal/60 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center space-x-2 px-3.5 py-2 text-xs uppercase tracking-wider text-off-white/70 hover:text-gold-light transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Live Academy Site</span>
        </Link>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-sm transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
