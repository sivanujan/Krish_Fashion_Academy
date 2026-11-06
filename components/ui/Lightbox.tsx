"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  caption?: string | null;
  category?: string;
}

export function Lightbox({
  isOpen,
  onClose,
  imageUrl,
  caption,
  category,
}: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-darkest/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-charcoal-darker/80 text-off-white hover:text-gold border border-gold/30 hover:border-gold transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-h-[75vh] overflow-hidden rounded-sm border border-gold/40 shadow-2xl">
          <Image
            src={imageUrl}
            alt={caption || "KFA Atelier Creation"}
            width={1200}
            height={800}
            className="w-auto h-auto max-h-[75vh] object-contain"
            priority
          />
        </div>

        {(caption || category) && (
          <div className="mt-4 text-center max-w-xl">
            {category && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium mb-1 block">
                {category}
              </span>
            )}
            {caption && (
              <p className="text-off-white/90 text-sm font-light tracking-wide">
                {caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
