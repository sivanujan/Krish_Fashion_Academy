import { notFound } from "next/navigation";
import StitchDevClient from "./StitchDevClient";

export const metadata = { title: "Stitch dev", robots: { index: false, follow: false } };

export default function StitchDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StitchDevClient />;
}
