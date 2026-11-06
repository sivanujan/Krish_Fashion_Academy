"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, User, LogOut, ArrowLeft, Shield } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  userName: string;
  userRole?: string;
}

export default function DashboardSidebar({
  userName,
  userRole = "student",
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      name: "My Courses",
      href: "/dashboard",
      icon: BookOpen,
      exact: true,
    },
    {
      name: "Profile Settings",
      href: "/dashboard/profile",
      icon: User,
      exact: false,
    },
  ];

  return (
    <aside className="w-64 bg-charcoal-darkest border-r border-charcoal/80 flex flex-col justify-between h-screen sticky top-0 text-off-white select-none">
      <div>
        {/* Brand / Logo */}
        <div className="p-6 border-b border-charcoal/60">
          <Link href="/">
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
          <div className="mt-3 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-gold-light">
              Student Classroom
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 border-b border-charcoal/40 bg-charcoal-darker/50">
          <p className="text-xs text-off-white/50 uppercase tracking-wider">Signed in as</p>
          <p className="font-serif text-base text-off-white font-medium truncate mt-0.5">
            {userName}
          </p>
          {userRole === "admin" && (
            <Link
              href="/admin"
              className="mt-2 inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-wider text-gold-light hover:text-gold"
            >
              <Shield className="w-3 h-3" />
              <span>Go to Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          {links.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider font-medium transition-colors",
                  isActive
                    ? "bg-gold text-charcoal-darkest shadow-md"
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

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-charcoal/60 space-y-2">
        <Link
          href="/"
          className="flex items-center space-x-2.5 px-4 py-2 text-xs uppercase tracking-wider text-off-white/60 hover:text-off-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Academy Home</span>
        </Link>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-sm transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
