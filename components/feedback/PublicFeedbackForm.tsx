"use client";

import { useState } from "react";
import Link from "next/link";
import { submitPublicFeedbackAction } from "@/lib/actions/feedback";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";

interface PublicFeedbackFormProps {
  token: string;
  batchTitle: string;
  batchDates: string;
}

export default function PublicFeedbackForm({
  token,
  batchTitle,
  batchDates,
}: PublicFeedbackFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingTeaching, setRatingTeaching] = useState(5);
  const [ratingContent, setRatingContent] = useState(5);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [consentToPublish, setConsentToPublish] = useState(true);
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitPublicFeedbackAction({
        token,
        name: name.trim(),
        phone: phone.trim(),
        rating_overall: ratingOverall,
        rating_teaching: ratingTeaching,
        rating_content: ratingContent,
        liked: liked.trim(),
        improve: improve.trim() || undefined,
        would_recommend: wouldRecommend,
        consent_to_publish: consentToPublish,
        website_honeypot: honeypot || undefined,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(res.error || "Failed to submit feedback");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-surface rounded-sm border border-gold/40 p-8 sm:p-12 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl text-charcoal-darkest">
          Thank You, {name}!
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-light max-w-md mx-auto leading-relaxed">
          Your review for <strong className="text-heading">{batchTitle}</strong> has been received. Your feedback helps us continually elevate our hands-on tailoring masterclasses.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center text-xs uppercase tracking-widest text-gold-dark hover:text-gold font-semibold"
          >
            Return to Academy Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-sm border border-charcoal/15 shadow-xl p-6 sm:p-10 space-y-6">
      <div className="border-b border-charcoal/10 pb-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold-dark font-semibold block mb-1">
          {batchDates} · Scarborough Studio
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-darkest">
          {batchTitle}
        </h1>
        <p className="mt-1 text-xs text-charcoal-light">
          Please take 1 minute to share your experience crafting your saree blouse.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Anti-spam Honeypot */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your Full Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kavitha Selvarajah"
          />

          <Input
            label="Phone Number (for verification) *"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 647-501-9569"
          />
        </div>

        {/* Large, Tappable Star Ratings for Mobile */}
        <div className="space-y-4 pt-2">
          <div className="bg-subtle/50 p-4 rounded-sm border border-charcoal/10">
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-2">
              Overall Experience *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingOverall(star)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus:outline-none p-1 rounded-sm hover:bg-gold/10 transition-colors"
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingOverall
                        ? "fill-gold text-gold"
                        : "text-charcoal/20"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-gold-dark ml-2">
                {ratingOverall} / 5
              </span>
            </div>
          </div>

          <div className="bg-subtle/50 p-4 rounded-sm border border-charcoal/10">
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-2">
              Teacher&apos;s Guidance &amp; Patience *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingTeaching(star)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus:outline-none p-1 rounded-sm hover:bg-gold/10 transition-colors"
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingTeaching
                        ? "fill-gold text-gold"
                        : "text-charcoal/20"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-gold-dark ml-2">
                {ratingTeaching} / 5
              </span>
            </div>
          </div>

          <div className="bg-subtle/50 p-4 rounded-sm border border-charcoal/10">
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-2">
              Curriculum &amp; Paper Pattern Formulas *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingContent(star)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus:outline-none p-1 rounded-sm hover:bg-gold/10 transition-colors"
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingContent
                        ? "fill-gold text-gold"
                        : "text-charcoal/20"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-gold-dark ml-2">
                {ratingContent} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Written Feedback */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
            What did you enjoy most about the 2-day class? *
          </label>
          <textarea
            rows={3}
            required
            value={liked}
            onChange={(e) => setLiked(e.target.value)}
            placeholder="e.g. Taking measurements and finishing my own blouse in just 2 days was amazing..."
            className="w-full bg-surface border border-charcoal/20 rounded-sm p-3 text-xs text-heading focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
            Any suggestions to make the masterclass even better?
          </label>
          <textarea
            rows={2}
            value={improve}
            onChange={(e) => setImprove(e.target.value)}
            placeholder="e.g. Would love a follow-up class for lining saree blouses..."
            className="w-full bg-surface border border-charcoal/20 rounded-sm p-3 text-xs text-heading focus:outline-none focus:border-gold"
          />
        </div>

        {/* Recommendation & Consent */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center space-x-3 text-xs text-heading cursor-pointer">
            <input
              type="checkbox"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="w-4 h-4 rounded text-gold focus:ring-gold"
            />
            <span>I would recommend Krish Fashion Academy to others</span>
          </label>

          <label className="flex items-center space-x-3 text-xs text-heading cursor-pointer">
            <input
              type="checkbox"
              checked={consentToPublish}
              onChange={(e) => setConsentToPublish(e.target.checked)}
              className="w-4 h-4 rounded text-gold focus:ring-gold"
            />
            <span>You may feature my feedback on the website (first name &amp; initial only)</span>
          </label>
        </div>

        <div className="pt-3">
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            Submit Feedback
          </Button>
        </div>
      </form>
    </div>
  );
}
