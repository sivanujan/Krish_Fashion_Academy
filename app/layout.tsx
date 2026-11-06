import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/animations/SmoothScroll";
import Preloader from "@/components/animations/Preloader";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Krish Fashion Academy",
    default: "Tailoring & Saree Blouse Classes in Scarborough, Toronto | Krish Fashion Academy",
  },
  description:
    "Beginner-friendly master classes in saree blouse tailoring in Scarborough, Toronto. Learn measurements, paper patterns, cutting and stitching, and finish your own blouse in 2 days.",
  keywords: [
    "Krish Fashion Academy",
    "Saree Blouse Classes Scarborough",
    "Tailoring Classes Toronto",
    "Saree blouse tailoring Ontario",
    "Beginner sewing classes Scarborough",
    "3-dart saree blouse masterclass",
    "Paper pattern drafting Toronto",
  ],
  authors: [{ name: "Krish Fashion Academy" }],
  icons: {
    icon: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "Tailoring & Saree Blouse Classes in Scarborough, Toronto | Krish Fashion Academy",
    description:
      "Beginner-friendly saree blouse tailoring classes in Scarborough, Toronto. Finish your blouse in just 2 days. In-person & online.",
    url: "https://krishfashionacademy.com",
    siteName: "Krish Fashion Academy",
    locale: "en_CA",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://krishfashionacademy.com/#business",
      name: "Krish Fashion Academy",
      image: "https://krishfashionacademy.com/brand/KFA_logo_horizontal.png",
      telephone: "+16475019569",
      url: "https://krishfashionacademy.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Middlefield Rd & McNicoll Ave",
        addressLocality: "Scarborough",
        addressRegion: "ON",
        addressCountry: "CA",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 43.822986,
        longitude: -79.263885,
      },
      priceRange: "$$",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Sunday"],
          opens: "11:00",
          closes: "16:00",
        },
      ],
    },
    {
      "@type": "Course",
      "@id": "https://krishfashionacademy.com/courses/saree-blouse-master-class#course",
      name: "2-Day Saree Blouse Master Class",
      description:
        "Beginner-friendly 3-dart saree blouse tailoring class. Learn measurements, paper patterns, cutting and stitching, and finish your own blouse in 2 days.",
      provider: {
        "@type": "Organization",
        name: "Krish Fashion Academy",
        sameAs: "https://krishfashionacademy.com",
      },
      educationalCredentialAwarded: "Certificate of Completion",
      offers: {
        "@type": "Offer",
        price: "350.00",
        priceCurrency: "CAD",
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "Event",
      "@id": "https://krishfashionacademy.com/classes#event",
      name: "2-Day Saree Blouse Master Class (Scarborough)",
      startDate: "2026-11-22T11:00:00-05:00",
      endDate: "2026-11-29T16:00:00-05:00",
      eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: [
        {
          "@type": "Place",
          name: "Krish Fashion Academy Studio",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Middlefield Rd & McNicoll Ave",
            addressLocality: "Scarborough",
            addressRegion: "ON",
            addressCountry: "CA",
          },
        },
        {
          "@type": "VirtualLocation",
          url: "https://krishfashionacademy.com/classes",
        },
      ],
      organizer: {
        "@type": "Organization",
        name: "Krish Fashion Academy",
        url: "https://krishfashionacademy.com",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-off-white text-heading antialiased">
        <Preloader />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
