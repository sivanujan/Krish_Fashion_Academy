import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-charcoal-darkest text-off-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center text-xs uppercase tracking-widest text-off-white/70 hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Academy</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="relative w-48 h-12">
              <Image
                src="/brand/KFA_logo_horizontal_transparent.png"
                alt="Krish Fashion Academy"
                width={200}
                height={48}
                priority
                className="object-contain"
              />
            </div>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-light/80 mt-2 font-medium">
            Student & Faculty Portal
          </span>
        </div>

        {/* Auth Card Box */}
        <div className="bg-charcoal-darker border border-gold/30 rounded-sm py-8 px-6 sm:px-10 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
