import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Canadian Dollars (CAD)
 */
export function formatCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Backwards compatibility alias for formatCAD
 * @deprecated Use formatCAD instead
 */
export const formatLKR = formatCAD;

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

export function formatBatchDates(
  dates: string[] | null | undefined,
  startDate?: string | null,
  secondDate?: string | null
): string {
  if (dates && dates.length > 0) {
    if (dates.length === 1) {
      return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(dates[0]));
    }
    const d1 = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(dates[0]));
    const d2 = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(dates[1]));
    return `${d1} & ${d2}`;
  }
  if (startDate) {
    const d1 = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(startDate));
    if (secondDate) {
      const d2 = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(secondDate));
      return `${d1} & ${d2}`;
    }
    return d1;
  }
  return "";
}

export function getWhatsAppUrl(phone: string = "16475019569", message: string = ""): string {
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  // Ensure the Academy WhatsApp number is always the Scarborough, Toronto number (+1 647-501-9569)
  if (!cleanPhone || cleanPhone.startsWith("94") || cleanPhone === "94771234567") {
    cleanPhone = "16475019569";
  }
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMsg}` : ""}`;
}
