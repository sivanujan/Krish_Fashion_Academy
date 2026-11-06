"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  moderateFeedbackAction,
  replyFeedbackAction,
} from "@/lib/actions/feedback";
import type { Feedback } from "@/types/database";
import { Star, Eye, EyeOff, MessageSquare, CheckCircle2 } from "lucide-react";

interface FeedbackItem extends Feedback {
  batch_title?: string;
  batch_code?: string;
}

interface FeedbackModeratorClientProps {
  initialFeedback: FeedbackItem[];
}

export default function FeedbackModeratorClient({
  initialFeedback,
}: FeedbackModeratorClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "hidden">("all");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = initialFeedback.filter((f) => {
    if (filter === "all") return true;
    return f.status === filter;
  });

  const handleModerate = async (id: string, status: "approved" | "hidden") => {
    await moderateFeedbackAction(id, status);
    router.refresh();
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    await replyFeedbackAction(id, replyText.trim());
    setReplyingId(null);
    setReplyText("");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex border-b border-charcoal/20 space-x-6 text-xs uppercase tracking-wider font-semibold">
        {(["all", "pending", "approved", "hidden"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 border-b-2 capitalize transition-colors ${
              filter === tab
                ? "border-gold text-gold-dark font-bold"
                : "border-transparent text-charcoal-light hover:text-charcoal"
            }`}
          >
            {tab} ({initialFeedback.filter((f) => (tab === "all" ? true : f.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 bg-surface rounded-sm border border-charcoal/15 text-center text-charcoal-light text-sm">
            No feedback found under this filter.
          </div>
        ) : (
          filtered.map((f) => (
            <div
              key={f.id}
              className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif text-lg font-medium text-heading">
                      {f.name}
                    </span>
                    {f.batch_code && (
                      <span className="text-[10px] font-mono bg-gold/10 text-gold-dark px-2 py-0.5 rounded-sm">
                        {f.batch_code}
                      </span>
                    )}
                    <Badge
                      variant={
                        f.status === "approved"
                          ? "success"
                          : f.status === "pending"
                          ? "gold"
                          : "neutral"
                      }
                    >
                      {f.status}
                    </Badge>
                    {f.consent_to_publish && (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Website Consent</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mt-1 text-xs text-charcoal-light">
                    <div className="flex items-center text-gold">
                      {[...Array(f.rating_overall)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <span>Teaching: {f.rating_teaching}/5</span>
                    <span>Content: {f.rating_content}/5</span>
                    <span className="text-charcoal-light/60">
                      {new Date(f.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {f.status !== "approved" ? (
                    <button
                      onClick={() => handleModerate(f.id, "approved")}
                      className="inline-flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm hover:bg-emerald-100 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(f.id, "hidden")}
                      className="inline-flex items-center space-x-1 text-xs text-charcoal-light bg-subtle border border-charcoal/20 px-3 py-1.5 rounded-sm hover:bg-charcoal/10"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-2 text-xs text-charcoal bg-subtle/50 p-4 rounded-sm">
                <div>
                  <strong className="text-heading block mb-0.5">What they liked:</strong>
                  <p className="italic leading-relaxed">{f.liked}</p>
                </div>

                {f.improve && (
                  <div className="pt-2 border-t border-charcoal/10">
                    <strong className="text-heading block mb-0.5">Suggestions to improve:</strong>
                    <p className="italic leading-relaxed">{f.improve}</p>
                  </div>
                )}
              </div>

              {/* Reply */}
              {f.admin_reply ? (
                <div className="p-3 bg-gold/10 border-l-2 border-gold rounded-r-sm text-xs text-heading">
                  <strong>Krish&apos;s Reply:</strong> {f.admin_reply}
                </div>
              ) : replyingId === f.id ? (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write response..."
                    className="flex-1 bg-surface border border-charcoal/20 rounded-sm px-3 py-1.5 text-xs text-heading focus:outline-none focus:border-gold"
                  />
                  <Button size="sm" onClick={() => handleReply(f.id)}>
                    Submit Reply
                  </Button>
                  <button
                    onClick={() => setReplyingId(null)}
                    className="text-xs text-charcoal-light hover:text-charcoal"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingId(f.id)}
                  className="inline-flex items-center space-x-1 text-xs text-gold-dark hover:text-gold uppercase tracking-wider font-semibold"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
