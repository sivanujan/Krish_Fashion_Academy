"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
} from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import { formatDate } from "@/lib/utils";
import type { PlayerRecording, MyRecording } from "@/types/database";

interface WatchRecordingClientProps {
  recording: PlayerRecording;
  siblingRecordings: MyRecording[];
}

export default function WatchRecordingClient({
  recording,
  siblingRecordings,
}: WatchRecordingClientProps) {
  // Find current index to determine previous & next recordings
  const currentIndex = siblingRecordings.findIndex((r) => r.id === recording.id);
  const previousRecording = currentIndex > 0 ? siblingRecordings[currentIndex - 1] : null;
  const nextRecording =
    currentIndex >= 0 && currentIndex < siblingRecordings.length - 1
      ? siblingRecordings[currentIndex + 1]
      : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-charcoal/10">
        <Link
          href="/dashboard/recordings"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-gold-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Recordings</span>
        </Link>

        {/* Next / Previous Controls */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {previousRecording ? (
            <Link
              href={`/dashboard/recordings/${previousRecording.id}`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 border border-charcoal/20 rounded-sm text-xs text-charcoal hover:border-gold hover:text-gold-dark transition-colors"
              title={previousRecording.title}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Lesson</span>
            </Link>
          ) : (
            <span className="inline-flex items-center space-x-1 px-3 py-1.5 border border-charcoal/10 rounded-sm text-xs text-charcoal/30 cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </span>
          )}

          {nextRecording ? (
            <Link
              href={`/dashboard/recordings/${nextRecording.id}`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-charcoal text-off-white hover:bg-gold hover:text-charcoal-darkest rounded-sm text-xs font-medium transition-colors shadow-sm"
              title={nextRecording.title}
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="inline-flex items-center space-x-1 px-3 py-1.5 border border-charcoal/10 rounded-sm text-xs text-charcoal/30 cursor-not-allowed">
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Main Video Player */}
      <VideoPlayer
        recordingId={recording.id}
        sourceType={recording.source_type}
        embedSrc={recording.embed_src}
        videoId={recording.video_id}
        title={recording.title}
        initialPositionSeconds={recording.last_position_seconds || 0}
        initialCompleted={recording.completed || false}
      />

      {/* Recording Information & Metadata */}
      <div className="bg-surface border border-charcoal/15 rounded-sm p-6 sm:p-8 shadow-sm space-y-4">
        {/* Badges & Date */}
        <div className="flex flex-wrap items-center gap-2">
          {recording.batch_code && (
            <span className="font-mono text-xs uppercase bg-charcoal text-off-white px-2.5 py-1 rounded-sm font-semibold">
              Batch: {recording.batch_code}
            </span>
          )}
          {recording.course_title && (
            <span className="text-xs bg-gold/15 text-gold-dark border border-gold/30 px-2.5 py-1 rounded-sm font-medium">
              {recording.course_title}
            </span>
          )}
          {recording.class_date && (
            <span className="flex items-center space-x-1 text-xs text-charcoal-light">
              <Calendar className="w-3.5 h-3.5 text-gold-dark" />
              <span>Class Date: {formatDate(recording.class_date)}</span>
            </span>
          )}
          {recording.duration_minutes && (
            <span className="flex items-center space-x-1 text-xs text-charcoal-light">
              <Clock className="w-3.5 h-3.5 text-gold-dark" />
              <span>{recording.duration_minutes} minutes</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-darkest leading-snug">
          {recording.title}
        </h1>

        {/* Description / Instructor Notes */}
        {recording.description && (
          <div className="border-t border-charcoal/10 pt-4 space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
              Instructor Notes &amp; Lesson Summary
            </h4>
            <div className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap bg-subtle/40 p-4 rounded-sm border border-charcoal/10">
              {recording.description}
            </div>
          </div>
        )}
      </div>

      {/* Sibling Recordings in This Batch */}
      {siblingRecordings.length > 1 && (
        <div className="space-y-4 pt-4 border-t border-charcoal/10">
          <h3 className="font-serif text-xl text-charcoal-darkest">
            Other Lessons in This Cohort
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {siblingRecordings
              .filter((r) => r.id !== recording.id)
              .map((r) => (
                <Link
                  key={r.id}
                  href={`/dashboard/recordings/${r.id}`}
                  className="p-4 bg-surface border border-charcoal/15 hover:border-gold rounded-sm transition-all group space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-charcoal-light">
                    <span className="font-mono">{r.batch_code || "Lesson"}</span>
                    {r.class_date && <span>{formatDate(r.class_date)}</span>}
                  </div>
                  <h5 className="font-serif text-sm text-charcoal-darkest group-hover:text-gold-dark transition-colors line-clamp-1">
                    {r.title}
                  </h5>
                  <div className="text-[11px] text-gold-dark flex items-center justify-between pt-1">
                    <span>{r.completed ? "Watched" : "Watch now"}</span>
                    <span>&rarr;</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
