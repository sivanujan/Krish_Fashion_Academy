"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackTitle?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackTitle = "Krish Fashion Academy",
  className,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`w-full h-full min-h-[140px] bg-charcoal-darkest border border-gold/20 flex flex-col items-center justify-center p-4 text-center ${
          className || ""
        }`}
      >
        <div className="relative w-10 h-10 mb-2 opacity-70">
          <Image
            src="/brand/KFA_icon_transparent.png"
            alt="KFA Logo Icon"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <span className="font-serif text-xs text-gold-light tracking-wider">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
