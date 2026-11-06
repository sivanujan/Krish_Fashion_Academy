"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import BatchForm from "@/components/admin/BatchForm";
import {
  enrollParticipantAction,
  removeParticipantAction,
  updatePaymentAction,
  toggleFeedbackOpenAction,
} from "@/lib/actions/batches";
import {
  upsertLessonAction,
  deleteLessonAction,
} from "@/lib/actions/courses";
import {
  moderateFeedbackAction,
  replyFeedbackAction,
} from "@/lib/actions/feedback";
import { formatCAD, formatBatchDates, formatTime } from "@/lib/utils";
import type { ClassSession, Course, Profile, Lesson, Feedback } from "@/types/database";
import {
  Users,
  Video,
  MessageSquareQuote,
  Settings,
  Plus,
  Download,
  Share2,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";

export interface EnrolledParticipant {
  id: string; // enrollment id
  student_id: string;
  course_id: string;
  session_id: string;
  attendance_mode: "in_person" | "online";
  payment_status: "unpaid" | "paid" | "waived" | "refunded";
  amount_paid_cad: number | null;
  payment_note: string | null;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    phone: string | null;
    email?: string;
  } | null;
}

interface BatchDetailManagerProps {
  batch: ClassSession;
  courses: Course[];
  allStudents: Profile[];
  participants: EnrolledParticipant[];
  recordings: Lesson[];
  feedbackList: Feedback[];
  siteUrl?: string;
}

export default function BatchDetailManager({
  batch,
  courses,
  allStudents,
  participants,
  recordings,
  feedbackList,
  siteUrl = "http://localhost:3000",
}: BatchDetailManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"participants" | "recordings" | "feedback" | "edit">("participants");
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Participant Enrollment Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollMode, setEnrollMode] = useState<"new" | "existing">("new");
  const [selectedStudentId, setSelectedStudentId] = useState(allStudents[0]?.id || "");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [attendanceMode, setAttendanceMode] = useState<"in_person" | "online">("in_person");
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid" | "waived" | "refunded">("unpaid");
  const [amountPaidCad, setAmountPaidCad] = useState<number | "">("");
  const [paymentNote, setPaymentNote] = useState("");
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);

  // Recording Modal State
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [recTitle, setRecTitle] = useState("");
  const [recDate, setRecDate] = useState(batch.start_date || "");
  const [recProvider, setRecProvider] = useState<"youtube" | "bunny">("youtube");
  const [recVideoInput, setRecVideoInput] = useState("");
  const [recPublished, setRecPublished] = useState(true);
  const [isSubmittingRec, setIsSubmittingRec] = useState(false);

  // Feedback reply state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const publicFeedbackUrl = `${siteUrl}/feedback/${batch.feedback_token}`;

  const copyFeedbackLink = async () => {
    try {
      await navigator.clipboard.writeText(publicFeedbackUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      alert(`Feedback Link: ${publicFeedbackUrl}`);
    }
  };

  const handleToggleFeedback = async (isOpen: boolean) => {
    try {
      await toggleFeedbackOpenAction(batch.id, isOpen);
      router.refresh();
    } catch {
      alert("Failed to update feedback status");
    }
  };

  // Helper to extract clean YouTube ID from full URL or return ID directly
  const extractVideoId = (input: string): string => {
    const trimmed = input.trim();
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return ytMatch ? ytMatch[1] : trimmed;
  };

  // 1. Submit Participant Enrollment
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEnroll(true);
    setErrorMsg(null);

    try {
      const res = await enrollParticipantAction({
        sessionId: batch.id,
        courseId: batch.course_id,
        studentId: enrollMode === "existing" ? selectedStudentId : undefined,
        newStudent: enrollMode === "new" ? {
          fullName: newFullName,
          email: newEmail,
          phone: newPhone,
          tempPassword: "KFA2026!",
        } : undefined,
        attendanceMode,
        paymentStatus,
        amountPaidCad: amountPaidCad ? Number(amountPaidCad) : undefined,
        paymentNote: paymentNote || undefined,
      });

      if (res.success) {
        setIsEnrollModalOpen(false);
        setNewFullName("");
        setNewEmail("");
        setNewPhone("");
        setPaymentNote("");
        setAmountPaidCad("");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to enroll participant");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

  // 2. Export Participants CSV
  const handleExportCsv = () => {
    const headers = ["Student Name", "Phone", "Email", "Attendance Mode", "Payment Status", "Amount Paid (CAD)", "Payment Note", "Enrolled Date"];
    const rows = participants.map((p) => [
      `"${p.profiles?.full_name || "Student"}"`,
      `"${p.profiles?.phone || ""}"`,
      `"${p.profiles?.email || ""}"`,
      `"${p.attendance_mode}"`,
      `"${p.payment_status}"`,
      `"${p.amount_paid_cad || 0}"`,
      `"${p.payment_note || ""}"`,
      `"${p.created_at}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `batch-${batch.batch_code}-participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Remove Participant
  const handleRemoveParticipant = async (enrollmentId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this batch?`)) return;
    try {
      await removeParticipantAction(enrollmentId, batch.id);
      router.refresh();
    } catch {
      alert("Failed to remove participant");
    }
  };

  // 4. Update Payment
  const handleUpdatePayment = async (
    enrollmentId: string,
    currentStatus: "unpaid" | "paid" | "waived" | "refunded" | null,
    currentAmt: number | null,
    currentNote: string | null
  ) => {
    const promptStatus = prompt(
      "Update payment status (unpaid, paid, waived, refunded):",
      currentStatus || "unpaid"
    );
    if (!promptStatus || !["unpaid", "paid", "waived", "refunded"].includes(promptStatus)) return;
    const newStatus = promptStatus as "unpaid" | "paid" | "waived" | "refunded";

    const amtStr = prompt("Amount Paid (CAD $):", currentAmt ? String(currentAmt) : "350");
    const noteStr = prompt("Payment Note (e.g. Interac ref or In-person cash):", currentNote || "");

    await updatePaymentAction(
      enrollmentId,
      batch.id,
      newStatus,
      amtStr ? parseFloat(amtStr) : null,
      noteStr || null
    );
    router.refresh();
  };

  // 5. Submit Recording
  const handleAddRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRec(true);
    try {
      const cleanVideoId = extractVideoId(recVideoInput);
      const res = await upsertLessonAction(null, {
        course_id: batch.course_id,
        session_id: batch.id,
        title: recTitle,
        class_date: recDate || null,
        video_provider: recProvider,
        video_id: cleanVideoId,
        is_published: recPublished,
        sort_order: recordings.length + 1,
      });

      if (res.success) {
        setIsRecordingModalOpen(false);
        setRecTitle("");
        setRecVideoInput("");
        router.refresh();
      } else {
        alert(res.error || "Failed to add recording");
      }
    } catch {
      alert("Failed to add recording");
    } finally {
      setIsSubmittingRec(false);
    }
  };

  // 6. Delete Recording
  const handleDeleteRecording = async (recId: string, title: string) => {
    if (!confirm(`Delete recording "${title}"?`)) return;
    await deleteLessonAction(recId);
    router.refresh();
  };

  // 7. Moderate Feedback
  const handleModerateFeedback = async (feedbackId: string, status: "approved" | "hidden") => {
    await moderateFeedbackAction(feedbackId, status);
    router.refresh();
  };

  // 8. Reply to Feedback
  const handleReplyFeedback = async (feedbackId: string) => {
    if (!replyText.trim()) return;
    await replyFeedbackAction(feedbackId, replyText.trim());
    setReplyingId(null);
    setReplyText("");
    router.refresh();
  };

  // Feedback calculations
  const totalFeedback = feedbackList.length;
  const avgOverall = totalFeedback > 0 ? (feedbackList.reduce((acc, f) => acc + f.rating_overall, 0) / totalFeedback).toFixed(1) : "—";
  const avgTeaching = totalFeedback > 0 ? (feedbackList.reduce((acc, f) => acc + f.rating_teaching, 0) / totalFeedback).toFixed(1) : "—";
  const avgContent = totalFeedback > 0 ? (feedbackList.reduce((acc, f) => acc + f.rating_content, 0) / totalFeedback).toFixed(1) : "—";

  const formattedDates = formatBatchDates(batch.class_dates, batch.start_date, batch.second_date);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs font-mono font-bold bg-gold/15 text-gold-dark px-2 py-0.5 rounded-sm">
              {batch.batch_code}
            </span>
            <Badge
              variant={
                batch.status === "completed"
                  ? "neutral"
                  : batch.status === "ongoing"
                  ? "gold"
                  : batch.status === "upcoming"
                  ? "success"
                  : "danger"
              }
            >
              {batch.status}
            </Badge>
            <span className="text-xs text-charcoal-light">·</span>
            <span className="text-xs text-charcoal-light uppercase font-semibold">
              {batch.mode === "both" ? "In-Person & Online" : batch.mode}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-darkest">
            {batch.title}
          </h1>

          <p className="text-xs text-charcoal-light mt-1">
            {formattedDates} · {formatTime(batch.start_time)} – {formatTime(batch.end_time)} · {batch.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/classes/${batch.batch_code}`}
            target="_blank"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-charcoal hover:text-gold uppercase tracking-wider bg-subtle px-3 py-2 rounded-sm border border-charcoal/10"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Page</span>
          </Link>

          <Button
            size="sm"
            onClick={() => setActiveTab("edit")}
            variant={activeTab === "edit" ? "primary" : "outline"}
          >
            <Settings className="w-3.5 h-3.5 mr-1" />
            <span>Edit Settings</span>
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-charcoal/20 space-x-6 text-xs uppercase tracking-wider font-semibold">
        <button
          onClick={() => setActiveTab("participants")}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === "participants"
              ? "border-gold text-gold-dark font-bold"
              : "border-transparent text-charcoal-light hover:text-charcoal"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participants ({participants.length}/{batch.seats_total})</span>
        </button>

        <button
          onClick={() => setActiveTab("recordings")}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === "recordings"
              ? "border-gold text-gold-dark font-bold"
              : "border-transparent text-charcoal-light hover:text-charcoal"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Recordings ({recordings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("feedback")}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === "feedback"
              ? "border-gold text-gold-dark font-bold"
              : "border-transparent text-charcoal-light hover:text-charcoal"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Feedback ({feedbackList.length})</span>
        </button>
      </div>

      {/* TAB 1: PARTICIPANTS */}
      {activeTab === "participants" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-sm border border-charcoal/10">
            <div className="flex items-center space-x-3 text-xs text-charcoal">
              <span className="font-semibold">{participants.length} Enrolled</span>
              <span>·</span>
              <span className="text-amber-700 font-medium">
                {participants.filter((p) => p.payment_status === "unpaid").length} Unpaid
              </span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">
                {participants.filter((p) => p.payment_status === "paid").length} Paid
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center space-x-1.5 text-xs text-charcoal hover:text-gold uppercase tracking-wider bg-subtle px-3 py-1.5 rounded-sm border border-charcoal/10 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <Button size="sm" onClick={() => setIsEnrollModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add Participant</span>
              </Button>
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-surface rounded-sm border border-charcoal/15 shadow-sm overflow-hidden">
            {participants.length === 0 ? (
              <div className="p-10 text-center text-charcoal-light text-sm">
                No participants enrolled yet. Click &quot;Add Participant&quot; to enroll your first student.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-subtle text-charcoal font-medium uppercase tracking-wider border-b border-charcoal/10">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Note</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/10">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-subtle/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-medium text-heading text-sm block">
                            {p.profiles?.full_name || "Student User"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-charcoal-light font-mono">
                          <div>{p.profiles?.phone || "No phone"}</div>
                          <div className="text-[11px] text-charcoal-light/70">{p.profiles?.email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-sm bg-charcoal/10 text-charcoal">
                            {p.attendance_mode === "in_person" ? "In-Person" : "Online"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleUpdatePayment(p.id, p.payment_status, p.amount_paid_cad, p.payment_note)}
                            className="cursor-pointer"
                            title="Click to change payment status"
                          >
                            <Badge
                              variant={
                                p.payment_status === "paid"
                                  ? "success"
                                  : p.payment_status === "unpaid"
                                  ? "danger"
                                  : "neutral"
                              }
                            >
                              {p.payment_status}
                            </Badge>
                          </button>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-gold-dark">
                          {p.amount_paid_cad ? formatCAD(p.amount_paid_cad) : "—"}
                        </td>

                        <td className="py-3 px-4 text-charcoal-light text-[11px]">
                          {p.payment_note || "—"}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRemoveParticipant(p.id, p.profiles?.full_name || "student")}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove from batch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECORDINGS */}
      {activeTab === "recordings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-sm border border-charcoal/10">
            <div>
              <p className="text-xs text-charcoal-light">
                Recordings uploaded here are accessible <strong className="text-heading">ONLY</strong> to participants enrolled in this batch.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsRecordingModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Recording</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recordings.length === 0 ? (
              <div className="col-span-2 p-10 bg-surface rounded-sm border border-charcoal/15 text-center text-charcoal-light text-sm">
                No recordings uploaded for this batch yet. Click &quot;Add Recording&quot; to upload Day 1 or Day 2 video classes.
              </div>
            ) : (
              recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-surface p-5 rounded-sm border border-charcoal/15 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-gold/10 text-gold-dark px-2 py-0.5 rounded-sm">
                        {rec.video_provider || "youtube"}
                      </span>
                      <h4 className="font-serif text-lg text-heading mt-1">
                        {rec.title}
                      </h4>
                      {rec.class_date && (
                        <span className="text-xs text-charcoal-light">Class Date: {rec.class_date}</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteRecording(rec.id, rec.title)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2.5 bg-subtle rounded-sm font-mono text-[11px] text-charcoal break-all">
                    Video ID: {rec.video_id}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-charcoal/10 text-xs">
                    <Badge variant={rec.is_published ? "success" : "neutral"}>
                      {rec.is_published ? "Published to Students" : "Draft"}
                    </Badge>

                    {rec.video_provider === "youtube" && rec.video_id && (
                      <a
                        href={`https://youtube.com/watch?v=${rec.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-gold-dark hover:text-gold uppercase tracking-wider font-semibold text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Watch on YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACK */}
      {activeTab === "feedback" && (
        <div className="space-y-6">
          {/* Feedback Stats & Sharing Bar */}
          <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl text-heading">
                  Student Feedback &amp; Reviews
                </h3>
                <p className="text-xs text-charcoal-light mt-0.5">
                  Share the feedback link on WhatsApp for in-person students or allow portal submissions.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggleFeedback(!batch.feedback_open)}
                  className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-semibold border transition-colors ${
                    batch.feedback_open
                      ? "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  }`}
                >
                  {batch.feedback_open ? "Close Feedback" : "Open Feedback"}
                </button>

                <button
                  onClick={copyFeedbackLink}
                  className="inline-flex items-center space-x-1.5 bg-subtle text-charcoal px-3 py-1.5 rounded-sm border border-charcoal/20 text-xs uppercase tracking-wider font-medium hover:bg-gold/15 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hi! Thank you for joining our Saree Blouse Master Class at Krish Fashion Academy. Please share your feedback and review here: ${publicFeedbackUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-sm text-xs uppercase tracking-wider font-semibold hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Averages */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-charcoal/10">
              <div className="bg-subtle/60 p-3 rounded-sm text-center">
                <span className="block text-[10px] uppercase tracking-wider text-charcoal-light">Total Reviews</span>
                <span className="font-serif text-2xl font-bold text-heading">{totalFeedback}</span>
              </div>
              <div className="bg-subtle/60 p-3 rounded-sm text-center">
                <span className="block text-[10px] uppercase tracking-wider text-charcoal-light">Overall Rating</span>
                <span className="font-serif text-2xl font-bold text-gold-dark">{avgOverall} / 5</span>
              </div>
              <div className="bg-subtle/60 p-3 rounded-sm text-center">
                <span className="block text-[10px] uppercase tracking-wider text-charcoal-light">Teaching Pace</span>
                <span className="font-serif text-2xl font-bold text-gold-dark">{avgTeaching} / 5</span>
              </div>
              <div className="bg-subtle/60 p-3 rounded-sm text-center">
                <span className="block text-[10px] uppercase tracking-wider text-charcoal-light">Content Depth</span>
                <span className="font-serif text-2xl font-bold text-gold-dark">{avgContent} / 5</span>
              </div>
            </div>
          </div>

          {/* Feedback Submissions List */}
          <div className="space-y-4">
            {feedbackList.length === 0 ? (
              <div className="p-10 bg-surface rounded-sm border border-charcoal/15 text-center text-charcoal-light text-sm">
                No feedback received yet for this batch. Click &quot;Copy Link&quot; or &quot;WhatsApp&quot; to invite students.
              </div>
            ) : (
              feedbackList.map((f) => (
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
                        {f.phone && (
                          <span className="text-xs font-mono text-charcoal-light">({f.phone})</span>
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
                      </div>

                      <div className="flex items-center space-x-4 mt-1 text-xs text-charcoal-light">
                        <div className="flex items-center text-gold">
                          {[...Array(f.rating_overall)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                          ))}
                        </div>
                        <span>Teaching: {f.rating_teaching}/5</span>
                        <span>Content: {f.rating_content}/5</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {f.status !== "approved" ? (
                        <button
                          onClick={() => handleModerateFeedback(f.id, "approved")}
                          className="inline-flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-sm hover:bg-emerald-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Approve for Site</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateFeedback(f.id, "hidden")}
                          className="inline-flex items-center space-x-1 text-xs text-charcoal-light bg-subtle border border-charcoal/20 px-3 py-1 rounded-sm hover:bg-charcoal/10"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide from Site</span>
                        </button>
                      )}
                    </div>
                  </div>

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
                        placeholder="Write admin reply..."
                        className="flex-1 bg-surface border border-charcoal/20 rounded-sm px-3 py-1.5 text-xs text-heading focus:outline-none focus:border-gold"
                      />
                      <Button size="sm" onClick={() => handleReplyFeedback(f.id)}>
                        Send
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
                      className="text-xs text-gold-dark hover:text-gold uppercase tracking-wider font-semibold"
                    >
                      + Add Reply
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EDIT BATCH SETTINGS */}
      {activeTab === "edit" && (
        <BatchForm courses={courses} initialBatch={batch} />
      )}

      {/* ENROLL PARTICIPANT MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-sm border border-charcoal/20 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h3 className="font-serif text-2xl text-charcoal-darkest">
                Add Participant to Batch
              </h3>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-charcoal-light hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              {/* Toggle Mode */}
              <div className="flex rounded-sm bg-subtle p-1 border border-charcoal/15 text-xs">
                <button
                  type="button"
                  onClick={() => setEnrollMode("new")}
                  className={`flex-1 py-1.5 rounded-sm font-semibold transition-colors ${
                    enrollMode === "new" ? "bg-surface shadow-sm text-heading" : "text-charcoal-light"
                  }`}
                >
                  Create New Student Account
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollMode("existing")}
                  className={`flex-1 py-1.5 rounded-sm font-semibold transition-colors ${
                    enrollMode === "existing" ? "bg-surface shadow-sm text-heading" : "text-charcoal-light"
                  }`}
                >
                  Select Existing Student
                </button>
              </div>

              {enrollMode === "existing" ? (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1">
                    Select Student *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-3 py-2 text-xs text-heading"
                  >
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.phone || "No phone"})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Full Name *"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Priya Shanmugam"
                  />
                  <Input
                    label="Email (Used to log in to student portal) *"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="student@example.com"
                  />
                  <Input
                    label="Phone Number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 647-501-9569"
                  />
                  <p className="text-[11px] text-charcoal-light">
                    Default temp password will be set to: <code className="font-mono text-gold-dark font-bold">KFA2026!</code>
                  </p>
                </div>
              )}

              {/* Attendance Mode */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1">
                    Attendance Mode *
                  </label>
                  <select
                    value={attendanceMode}
                    onChange={(e) => setAttendanceMode(e.target.value as "in_person" | "online")}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-3 py-2 text-xs text-heading"
                  >
                    <option value="in_person">In-Person (Studio)</option>
                    <option value="online">Live Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) =>
                      setPaymentStatus(
                        e.target.value as "unpaid" | "paid" | "waived" | "refunded"
                      )
                    }
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-3 py-2 text-xs text-heading"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Amount & Note */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Amount Paid (CAD $)"
                  type="number"
                  placeholder="350"
                  value={amountPaidCad}
                  onChange={(e) => setAmountPaidCad(e.target.value === "" ? "" : Number(e.target.value))}
                />

                <Input
                  label="Payment Note / Ref"
                  placeholder="e.g. Interac e-Transfer"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10">
                <Button type="button" variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmittingEnroll}>
                  Enroll &amp; Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORDING MODAL */}
      {isRecordingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-sm border border-charcoal/20 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h3 className="font-serif text-2xl text-charcoal-darkest">
                Add Batch Recording
              </h3>
              <button
                onClick={() => setIsRecordingModalOpen(false)}
                className="text-charcoal-light hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecording} className="space-y-4">
              <Input
                label="Recording Title *"
                required
                value={recTitle}
                onChange={(e) => setRecTitle(e.target.value)}
                placeholder="e.g. Day 1: Measurements & Paper Pattern"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Class Date"
                  type="date"
                  value={recDate}
                  onChange={(e) => setRecDate(e.target.value)}
                />

                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1">
                    Provider
                  </label>
                  <select
                    value={recProvider}
                    onChange={(e) => setRecProvider(e.target.value as "youtube" | "bunny")}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-3 py-2 text-xs text-heading"
                  >
                    <option value="youtube">YouTube (Unlisted)</option>
                    <option value="bunny">Bunny.net (Phase 2)</option>
                  </select>
                </div>
              </div>

              <Input
                label="YouTube Video ID or Full Link *"
                required
                value={recVideoInput}
                onChange={(e) => setRecVideoInput(e.target.value)}
                placeholder="e.g. dQw4w9WgXcQ or https://youtu.be/..."
              />

              <label className="flex items-center space-x-2 text-xs text-heading cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={recPublished}
                  onChange={(e) => setRecPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-gold focus:ring-gold"
                />
                <span>Publish immediately to enrolled students</span>
              </label>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10">
                <Button type="button" variant="outline" onClick={() => setIsRecordingModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmittingRec}>
                  Save Recording
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
