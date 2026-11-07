"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  CheckCircle2,
  ExternalLink,
  Lock,
  RotateCcw,
  Video,
  Shield,
  Volume2,
} from "lucide-react";
import Hls from "hls.js";
import { saveRecordingProgressAction } from "@/lib/actions/recordings";
import type { VideoSourceType } from "@/types/database";

export interface VideoPlayerProps {
  recordingId: string;
  sourceType: VideoSourceType;
  embedSrc: string | null;
  videoId: string | null;
  title: string;
  initialPositionSeconds?: number;
  initialCompleted?: boolean;
  onProgressSaved?: (position: number, completed: boolean) => void;
}

export default function VideoPlayer({
  recordingId,
  sourceType,
  embedSrc,
  videoId,
  title,
  initialPositionSeconds = 0,
  initialCompleted = false,
  onProgressSaved,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(initialCompleted);
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);
  const [lastSavedPosition, setLastSavedPosition] = useState(initialPositionSeconds);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [showResumedNotice, setShowResumedNotice] = useState(initialPositionSeconds > 5);

  // Auto-dismiss resume notice after 4 seconds
  useEffect(() => {
    if (showResumedNotice) {
      const timer = setTimeout(() => setShowResumedNotice(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showResumedNotice]);

  // HLS.js streaming initialization
  useEffect(() => {
    if (sourceType !== "hls" || !embedSrc || !videoRef.current) return;

    const videoEl = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(embedSrc);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (initialPositionSeconds > 0) {
          videoEl.currentTime = initialPositionSeconds;
        }
      });
    } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari iOS/macOS support
      videoEl.src = embedSrc;
      if (initialPositionSeconds > 0) {
        videoEl.currentTime = initialPositionSeconds;
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [sourceType, embedSrc, initialPositionSeconds]);

  // Direct MP4 resume playback position
  useEffect(() => {
    if (sourceType === "mp4" && videoRef.current && initialPositionSeconds > 0) {
      videoRef.current.currentTime = initialPositionSeconds;
    }
  }, [sourceType, initialPositionSeconds]);

  // Progress tracking interval for HTML5 video elements (MP4 & HLS)
  useEffect(() => {
    if (sourceType !== "mp4" && sourceType !== "hls") return;
    const video = videoRef.current;
    if (!video) return;

    let intervalId: NodeJS.Timeout;

    const handlePlay = () => {
      setHasStartedPlaying(true);
      intervalId = setInterval(async () => {
        if (!video || video.paused) return;
        const currentPos = Math.floor(video.currentTime);
        // Only save if advanced by at least 8 seconds
        if (Math.abs(currentPos - lastSavedPosition) >= 8) {
          setLastSavedPosition(currentPos);
          await saveRecordingProgressAction(recordingId, currentPos, completed);
          onProgressSaved?.(currentPos, completed);
        }
      }, 10000);
    };

    const handlePause = async () => {
      clearInterval(intervalId);
      if (video) {
        const currentPos = Math.floor(video.currentTime);
        await saveRecordingProgressAction(recordingId, currentPos, completed);
        onProgressSaved?.(currentPos, completed);
      }
    };

    const handleEnded = async () => {
      clearInterval(intervalId);
      setCompleted(true);
      await saveRecordingProgressAction(recordingId, Math.floor(video.duration || 0), true);
      onProgressSaved?.(Math.floor(video.duration || 0), true);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      clearInterval(intervalId);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [sourceType, recordingId, completed, lastSavedPosition, onProgressSaved]);

  // Manual "Mark as Watched" button toggle
  const handleToggleWatched = async () => {
    setIsMarkingWatched(true);
    const newStatus = !completed;
    try {
      const position = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
      const res = await saveRecordingProgressAction(recordingId, position, newStatus);
      if (res.success) {
        setCompleted(newStatus);
        onProgressSaved?.(position, newStatus);
      }
    } finally {
      setIsMarkingWatched(false);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Player Container with light anti-piracy deterrence (right click disabled) */}
      <div
        ref={containerRef}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        className="relative aspect-video w-full bg-charcoal-darkest rounded-sm overflow-hidden shadow-2xl border border-charcoal/30 flex items-center justify-center group"
      >
        {/* Resumed Playback Notification Pill */}
        {showResumedNotice && (
          <div className="absolute top-4 left-4 z-20 bg-charcoal-darkest/95 backdrop-blur-md text-gold-light border border-gold/30 px-3.5 py-1.5 rounded-sm text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 shadow-lg">
            <RotateCcw className="w-3.5 h-3.5 text-gold" />
            <span>
              Resumed from {Math.floor(initialPositionSeconds / 60)}:
              {(initialPositionSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
        )}

        {/* 1. ZOOM CLOUD RECORDING VIEW */}
        {sourceType === "zoom_link" && (
          <div className="text-center p-6 sm:p-10 max-w-lg space-y-4">
            <div className="w-16 h-16 rounded-full bg-charcoal/80 border border-gold/30 flex items-center justify-center mx-auto text-gold-light shadow-inner">
              <Video className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif text-lg sm:text-xl text-off-white">
                Zoom Cloud Recording
              </h3>
              <p className="text-xs text-off-white/70 mt-1 max-w-md mx-auto">
                Zoom cloud recordings open in a secure dedicated window. Your playback progress can be marked below after completion.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={embedSrc || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-light text-charcoal-darkest px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold transition-all shadow-md"
              >
                <span>Launch Zoom Recording</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>

            <p className="text-[11px] text-off-white/50 flex items-center justify-center space-x-1.5">
              <Lock className="w-3 h-3 text-gold/60" />
              <span>If prompted by Zoom, enter the passcode provided in your batch notes.</span>
            </p>
          </div>
        )}

        {/* 2. DIRECT HTML5 VIDEO (MP4 & HLS) */}
        {(sourceType === "mp4" || sourceType === "hls") && (
          <video
            ref={videoRef}
            src={sourceType === "mp4" ? embedSrc || undefined : undefined}
            controls
            controlsList="nodownload"
            disablePictureInPicture={false}
            playsInline
            className="w-full h-full object-contain"
          />
        )}

        {/* 3. IFRAME EMBEDS (YouTube, Vimeo, Google Drive, Bunny Stream, Other) */}
        {sourceType !== "zoom_link" &&
          sourceType !== "mp4" &&
          sourceType !== "hls" &&
          embedSrc && (
            <iframe
              src={embedSrc}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}

        {/* Corner Watermark / Protection Badge */}
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity bg-charcoal-darkest/80 text-[10px] text-off-white/70 px-2 py-0.5 rounded-sm flex items-center space-x-1 font-mono">
          <Shield className="w-2.5 h-2.5 text-gold-light" />
          <span>KFA Atelier Portal</span>
        </div>
      </div>

      {/* Player Utility Bar: Mark as Watched & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-surface border border-charcoal/15 rounded-sm shadow-sm text-xs">
        <div className="flex items-center space-x-2">
          {completed ? (
            <span className="inline-flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed &amp; Watched</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 text-charcoal-light bg-subtle px-2.5 py-1 rounded-sm">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span>In Progress</span>
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={isMarkingWatched}
          onClick={handleToggleWatched}
          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold transition-all ${
            completed
              ? "border border-charcoal/20 text-charcoal hover:bg-subtle"
              : "bg-gold hover:bg-gold-light text-charcoal-darkest shadow-sm"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{completed ? "Mark as Unwatched" : "Mark as Watched"}</span>
        </button>
      </div>
    </div>
  );
}
