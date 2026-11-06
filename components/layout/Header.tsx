"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/#" },
  { name: "Courses", href: "/#courses" },
  { name: "About", href: "/#about" },
  { name: "Contact", href: "/#contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync mobile menu open state to body to hide floating WhatsApp
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("mobile-menu-active");
    } else {
      document.body.classList.remove("mobile-menu-active");
    }
    return () => {
      document.body.classList.remove("mobile-menu-active");
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);

    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      if (!targetId) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.pushState(null, "", "/");
      } else {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const navHeight = 72;
          const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - navHeight,
            behavior: "smooth",
          });
          history.pushState(null, "", `#${targetId}`);
        }
      }
    }
  };

  // On "/" only highlight HOME; on other pages highlight current route
  const isLinkActive = (href: string) => {
    if (pathname === "/") {
      return href === "/#";
    }
    return pathname === href;
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-bg-dark/95 backdrop-blur-md border-b border-border-dark py-2.5 shadow-lg"
          : "bg-gradient-to-b from-bg-dark/85 via-bg-dark/40 to-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LOGO: 30% larger (desktop height ~56px) and sharper (2x asset) */}
        <Link
          href="/#"
          onClick={(e) => handleNavClick(e, "/#")}
          className="flex items-center group py-1"
        >
          {/* Mobile icon only */}
          <div className="block md:hidden relative w-10 h-10">
            <Image
              src="/brand/KFA_icon_transparent.png"
              alt="Krish Fashion Academy Logo"
              width={40}
              height={40}
              priority
              className="object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(201,162,74,0.6)] transition-all"
            />
          </div>
          {/* Desktop full horizontal logo 30% larger (~56px height) */}
          <div className="hidden md:block relative w-60 lg:w-64 h-14">
            <Image
              src="/brand/KFA_logo_horizontal_transparent.png"
              alt="Krish Fashion Academy"
              width={256}
              height={56}
              priority
              className="object-contain object-left filter group-hover:brightness-110 transition-all"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  "text-xs uppercase tracking-[0.2em] font-medium transition-colors relative py-1",
                  isActive
                    ? "text-gold font-semibold"
                    : "text-text-on-dark hover:text-gold-light"
                )}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Student Portal Button */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.18em] border border-gold/60 text-gold-light px-4 py-2 rounded-sm hover:bg-gold hover:text-bg-dark transition-all duration-300"
          >
            <User className="w-3.5 h-3.5" />
            <span>Portal</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="md:hidden p-2 text-text-on-dark hover:text-gold focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bg-dark-2 border-b border-border-dark px-6 pt-4 pb-8 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    "text-sm uppercase tracking-[0.2em] py-2 border-b border-border-dark/60 transition-colors",
                    isActive ? "text-gold font-semibold" : "text-text-on-dark"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 flex items-center justify-center space-x-2 bg-gold text-bg-dark py-3 rounded-sm uppercase tracking-widest text-xs font-semibold"
            >
              <User className="w-4 h-4" />
              <span>Student / Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
