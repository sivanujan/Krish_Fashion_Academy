"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Video,
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  Search,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { MyRecording } from "@/types/database";

interface MyRecordingsClientProps {
  initialRecordings: MyRecording[];
}

export default function MyRecordingsClient({
  initialRecordings,
}: MyRecordingsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");

  // Extract unique batches for filter
  const batches = useMemo(() => {
    const map = new Map<string, string>();
    initialRecordings.forEach((r) => {
      if (r.session_id && r.batch_code) {
        map.set(r.session_id, `${r.batch_code} (${r.batch_title || "Batch"})`);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [initialRecordings]);

  // Filter recordings
  const filtered = useMemo(() => {
    return initialRecordings.filter((rec) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rec.title.toLowerCase().includes(q) ||
        rec.course_title?.toLowerCase().includes(q) ||
        rec.batch_code?.toLowerCase().includes(q);

      const matchesBatch = selectedBatch === "all" || rec.session_id === selectedBatch;

      return matchesSearch && matchesBatch;
    });
  }, [initialRecordings, searchQuery, selectedBatch]);

  // Group by Course / Batch
  const groupedRecordings = useMemo(() => {
    const groups: { [key: string]: { title: string; subtitle: string; items: MyRecording[] } } = {};

    filtered.forEach((rec) => {
      const groupKey = rec.session_id
        ? `batch-${rec.session_id}`
        : rec.course_id
        ? `course-${rec.course_id}`
        : "general";

      if (!groups[groupKey]) {
        groups[groupKey] = {
          title: rec.course_title || "General Masterclass",
          subtitle: rec.batch_code ? `Batch ${rec.batch_code}` : "All Students",
          items: [],
        };
      }
      groups[groupKey].items.push(rec);
    });

    return Object.values(groups);
  }, [filtered]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      {initialRecordings.length > 0 && (
        <div className="bg-surface p-4 rounded-sm border border-charcoal/15 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search recordings by lesson topic or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-charcoal/20 rounded-sm pl-9 pr-3 py-2 text-xs text-heading placeholder:text-charcoal/40 focus:outline-none focus:border-gold"
            />
          </div>

          {batches.length > 1 && (
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-charcoal/40 shrink-0" />
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="bg-surface border border-charcoal/20 rounded-sm px-3 py-2 text-xs text-heading focus:outline-none focus:border-gold"
              >
                <option value="all">All My Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {initialRecordings.length === 0 ? (
        <div className="bg-surface border border-charcoal/15 rounded-sm p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-subtle border border-charcoal/15 flex items-center justify-center mx-auto text-charcoal/40">
            <Video className="w-8 h-8 stroke-1" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-charcoal-darkest">
              No Recordings Available Yet
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-charcoal-light leading-relaxed">
              Your teacher will upload the high-definition class recordings and practical exercise walkthroughs after each scheduled class session.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gold-dark hover:underline pt-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Return to Classroom Overview</span>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-charcoal-light text-xs bg-surface border border-charcoal/15 rounded-sm">
          No recordings found matching your search.
        </div>
      ) : (
        <div className="space-y-10">
          {groupedRecordings.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              {/* Group Header */}
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-charcoal-darkest">
                    {group.title}
                  </h3>
                  <span className="text-[11px] uppercase tracking-wider text-gold-dark font-medium">
                    {group.subtitle}
                  </span>
                </div>
                <span className="text-xs text-charcoal-light">
                  {group.items.length} {group.items.length === 1 ? "lesson" : "lessons"}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((recording) => (
                  <Link
                    key={recording.id}
                    href={`/dashboard/recordings/${recording.id}`}
                    className="group bg-surface border border-charcoal/15 hover:border-gold/60 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video w-full bg-charcoal-darkest overflow-hidden border-b border-charcoal/10 flex items-center justify-center">
                        {recording.thumbnail_url ? (
                          <Image
                            src={recording.thumbnail_url}
                            alt={recording.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="text-center p-6 text-off-white/70">
                            <Video className="w-10 h-10 mx-auto text-gold-light mb-2 stroke-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] uppercase font-mono tracking-widest text-off-white/50 block">
                              Krish Fashion Academy
                            </span>
                          </div>
                        )}

                        {/* Play Overlay Icon */}
                        <div className="absolute inset-0 bg-charcoal-darkest/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-gold text-charcoal-darkest flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          </div>
                        </div>

                        {/* Top-Right Watched / Progress Pill */}
                        <div className="absolute top-2.5 right-2.5">
                          {recording.completed ? (
                            <span className="bg-emerald-600/95 backdrop-blur-sm text-off-white text-[10px] px-2 py-0.5 rounded-sm font-medium flex items-center space-x-1 shadow">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Watched</span>
                            </span>
                          ) : recording.last_position_seconds > 0 ? (
                            <span className="bg-charcoal-darkest/90 backdrop-blur-sm text-gold-light text-[10px] px-2 py-0.5 rounded-sm font-medium flex items-center space-x-1 shadow">
                              <span>In Progress</span>
                            </span>
                          ) : null}
                        </div>

                        {/* Bottom-Right Duration */}
                        <div className="absolute bottom-2 right-2 bg-charcoal-darkest/90 text-off-white text-[10px] px-1.5 py-0.5 rounded-sm font-mono">
                          {recording.duration_minutes
                            ? `${recording.duration_minutes}m`
                            : recording.source_type.replace("_", " ")}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center space-x-2 text-[11px] text-charcoal-light">
                          {recording.batch_code && (
                            <span className="font-mono bg-charcoal/10 text-charcoal px-1.5 py-0.5 rounded-sm">
                              {recording.batch_code}
                            </span>
                          )}
                          {recording.class_date && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-gold-dark" />
                              <span>{formatDate(recording.class_date)}</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-lg text-charcoal-darkest group-hover:text-gold-dark transition-colors line-clamp-2 leading-snug">
                          {recording.title}
                        </h4>

                        {recording.description && (
                          <p className="text-xs text-charcoal-light line-clamp-2 leading-relaxed">
                            {recording.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div className="p-5 pt-0">
                      <div className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-charcoal group-hover:text-gold-dark border-t border-charcoal/10 pt-3 transition-colors">
                        <span>Watch Recording</span>
                        <Play className="w-3.5 h-3.5 ml-1 fill-current" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
