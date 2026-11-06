"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { submitPortalFeedbackAction } from "@/lib/actions/feedback";
import { formatBatchDates, formatTime } from "@/lib/utils";
import type { ClassSession, Lesson, Feedback } from "@/types/database";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Play,
  CheckCircle2,
  Star,
  ExternalLink,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";

interface BatchClassroomClientProps {
  batch: ClassSession;
  recordings: Lesson[];
  existingFeedback: Feedback | null;
  attendanceMode: "in_person" | "online";
}

export default function BatchClassroomClient({
  batch,
  recordings,
  existingFeedback,
  attendanceMode,
}: BatchClassroomClientProps) {
  const router = useRouter();

  // Active watching video
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(recordings[0] || null);

  // LocalStorage playback resume position
  const [savedTime, setSavedTime] = useState<number>(0);

  // Feedback form state
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingTeaching, setRatingTeaching] = useState(5);
  const [ratingContent, setRatingContent] = useState(5);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [consentToPublish, setConsentToPublish] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(!!existingFeedback);

  // Load last watched position from localStorage when activeLesson changes
  useEffect(() => {
    if (!activeLesson) return;
    try {
      const stored = localStorage.getItem(`kfa_lesson_time_${activeLesson.id}`);
      if (stored) {
        setSavedTime(parseFloat(stored));
      } else {
        setSavedTime(0);
      }
    } catch {
      setSavedTime(0);
    }
  }, [activeLesson]);

  // Save playback time periodically (simulated or on manual interval)
  const handleTimeUpdate = (seconds: number) => {
    if (!activeLesson) return;
    try {
      localStorage.setItem(`kfa_lesson_time_${activeLesson.id}`, String(seconds));
      setSavedTime(seconds);
    } catch {
      /* ignore */
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const res = await submitPortalFeedbackAction({
        sessionId: batch.id,
        ratingOverall,
        ratingTeaching,
        ratingContent,
        liked,
        improve,
        wouldRecommend,
        consentToPublish,
      });

      if (res.success) {
        setFeedbackSuccess(true);
        router.refresh();
      } else {
        alert(res.error || "Failed to submit feedback");
      }
    } catch {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const formattedDates = formatBatchDates(batch.class_dates, batch.start_date, batch.second_date);
  const timeRange = `${formatTime(batch.start_time)} – ${formatTime(batch.end_time)}`;

  const showFeedbackCard = batch.feedback_open || batch.status === "completed";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Batch Overview Banner */}
      <div className="bg-surface p-6 sm:p-8 rounded-sm border border-charcoal/15 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold bg-gold/15 text-gold-dark px-2.5 py-1 rounded-sm border border-gold/30">
              Batch: {batch.batch_code}
            </span>
            <Badge
              variant={
                batch.status === "completed"
                  ? "neutral"
                  : batch.status === "ongoing"
                  ? "gold"
                  : "success"
              }
            >
              {batch.status}
            </Badge>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-subtle text-charcoal uppercase">
              {attendanceMode === "in_person" ? "In-Person (Studio)" : "Live Online"}
            </span>
          </div>

          {/* Zoom Join Button (If online link available and batch upcoming or ongoing) */}
          {batch.online_join_url && (batch.status === "upcoming" || batch.status === "ongoing") && (
            <a
              href={batch.online_join_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all shadow-md animate-pulse"
            >
              <Video className="w-4 h-4" />
              <span>Join Live Zoom Classroom</span>
            </a>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          {batch.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-charcoal/10 text-xs text-charcoal">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-4 h-4 text-gold-dark shrink-0" />
            <div>
              <strong className="block text-heading font-medium">{formattedDates}</strong>
              <span className="text-[11px] text-charcoal-light">Two sessions</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-gold-dark shrink-0" />
            <div>
              <strong className="block text-heading font-medium">{timeRange}</strong>
              <span className="text-[11px] text-charcoal-light">11:00 AM – 4:00 PM EST</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <MapPin className="w-4 h-4 text-gold-dark shrink-0" />
            <div>
              <strong className="block text-heading font-medium">{batch.location}</strong>
              <span className="text-[11px] text-charcoal-light">Scarborough, ON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Recordings Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-darkest flex items-center space-x-2">
            <Video className="w-5 h-5 text-gold-dark" />
            <span>Class Recordings &amp; Demos</span>
          </h2>
          <p className="text-xs text-charcoal-light mt-0.5">
            Watch high-definition class recordings to review measurement formulas, pattern drafting, and stitch assembly anytime.
          </p>
        </div>

        {recordings.length === 0 ? (
          <div className="p-12 bg-surface rounded-sm border border-charcoal/15 text-center text-charcoal-light text-sm shadow-sm">
            Class recordings will be uploaded here after each live session finishes. Check back shortly!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Video Player Container */}
            <div className="lg:col-span-8 bg-charcoal-darkest rounded-sm overflow-hidden border border-charcoal/40 shadow-xl">
              {activeLesson?.video_provider === "youtube" && activeLesson.video_id ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeLesson.video_id}?rel=0&modestbranding=1&autoplay=0${
                      savedTime > 0 ? `&start=${Math.floor(savedTime)}` : ""
                    }`}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : activeLesson?.video_provider === "bunny" ? (
                <div className="aspect-video w-full flex flex-col items-center justify-center p-8 text-center text-off-white bg-charcoal-darker">
                  <Video className="w-12 h-12 text-gold mb-3" />
                  <h3 className="font-serif text-xl">Bunny.net Stream Player</h3>
                  <p className="text-xs text-off-white/60 max-w-sm mt-1">
                    Direct low-latency DRM streaming placeholder ready for Phase 2 integration.
                  </p>
                </div>
              ) : (
                <div className="aspect-video w-full flex items-center justify-center text-off-white/40 text-xs">
                  Select a lesson to begin watching
                </div>
              )}

              {/* Active Lesson Meta & Resume Hint */}
              {activeLesson && (
                <div className="p-5 text-off-white bg-charcoal-darker border-t border-charcoal/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-xl text-off-white">
                        {activeLesson.title}
                      </h3>
                      {activeLesson.class_date && (
                        <span className="text-xs text-gold-light/70 font-mono">
                          Class Date: {activeLesson.class_date}
                        </span>
                      )}
                    </div>

                    {savedTime > 0 && (
                      <span className="text-[11px] text-gold-light bg-gold/15 px-2.5 py-1 rounded-sm border border-gold/30">
                        Resumed from {Math.floor(savedTime / 60)}m {Math.floor(savedTime % 60)}s
                      </span>
                    )}
                  </div>

                  {activeLesson.description && (
                    <p className="mt-2 text-xs text-off-white/70 font-light leading-relaxed">
                      {activeLesson.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Playlist / Lessons List */}
            <div className="lg:col-span-4 bg-surface rounded-sm border border-charcoal/15 shadow-sm p-4 space-y-3">
              <h3 className="font-serif text-lg text-heading border-b border-charcoal/10 pb-2">
                Lessons in this Batch ({recordings.length})
              </h3>

              <div className="space-y-2">
                {recordings.map((rec, idx) => {
                  const isSelected = activeLesson?.id === rec.id;
                  return (
                    <button
                      key={rec.id}
                      onClick={() => setActiveLesson(rec)}
                      className={`w-full text-left p-3 rounded-sm border transition-all flex items-start space-x-3 cursor-pointer ${
                        isSelected
                          ? "bg-gold/15 border-gold text-heading shadow-sm"
                          : "bg-surface border-charcoal/10 hover:border-gold/50 text-charcoal"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? "bg-gold text-charcoal-darkest" : "bg-subtle text-charcoal"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-light block">
                          Lesson {idx + 1}
                        </span>
                        <h4 className="font-serif text-sm font-medium leading-snug line-clamp-1">
                          {rec.title}
                        </h4>
                        {rec.class_date && (
                          <span className="text-[11px] text-charcoal-light block mt-0.5">
                            {rec.class_date}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Give Feedback Card */}
      {showFeedbackCard && (
        <div className="bg-surface p-6 sm:p-8 rounded-sm border border-gold/30 shadow-md space-y-6">
          <div className="flex items-center space-x-2 text-gold-dark">
            <Sparkles className="w-5 h-5 text-gold-dark" />
            <h2 className="font-serif text-2xl text-charcoal-darkest">
              Share Your Feedback
            </h2>
          </div>

          {feedbackSuccess || existingFeedback ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-sm space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Thank you! Your feedback for this batch has been submitted.</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Krish and the academy team review every review with gratitude to continuously perfect our teaching.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6 max-w-2xl">
              <p className="text-xs text-charcoal-light">
                Tell us about your experience stitching your blouse in this master class.
              </p>

              {/* Star Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
                    Overall Experience *
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingOverall(star)}
                        className="p-1 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingOverall
                              ? "fill-gold text-gold"
                              : "text-charcoal/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
                    Teaching &amp; Guidance *
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingTeaching(star)}
                        className="p-1 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingTeaching
                              ? "fill-gold text-gold"
                              : "text-charcoal/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
                    Curriculum Content *
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingContent(star)}
                        className="p-1 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingContent
                              ? "fill-gold text-gold"
                              : "text-charcoal/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Liked Text */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
                  What did you like most about the class? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={liked}
                  onChange={(e) => setLiked(e.target.value)}
                  placeholder="e.g. Learning the paper pattern formula gave me confidence to cut blouses of any size..."
                  className="w-full bg-surface border border-charcoal/20 rounded-sm p-3 text-xs text-heading focus:outline-none focus:border-gold"
                />
              </div>

              {/* Suggestions */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
                  Any suggestions or areas to improve? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={improve}
                  onChange={(e) => setImprove(e.target.value)}
                  placeholder="e.g. Would love an advanced neck design workshop..."
                  className="w-full bg-surface border border-charcoal/20 rounded-sm p-3 text-xs text-heading focus:outline-none focus:border-gold"
                />
              </div>

              {/* Recommendation & Consent Checkboxes */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center space-x-2.5 text-xs text-heading cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wouldRecommend}
                    onChange={(e) => setWouldRecommend(e.target.checked)}
                    className="w-4 h-4 rounded text-gold focus:ring-gold"
                  />
                  <span>I would recommend Krish Fashion Academy to friends &amp; family</span>
                </label>

                <label className="flex items-center space-x-2.5 text-xs text-heading cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentToPublish}
                    onChange={(e) => setConsentToPublish(e.target.checked)}
                    className="w-4 h-4 rounded text-gold focus:ring-gold"
                  />
                  <span>You may feature my feedback on the website (first name and initial only)</span>
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isSubmittingFeedback}>
                  Submit My Review
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
