"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Video,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Share2,
  X,
  Play,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { parseVideoSource, type ParseVideoOutput } from "@/lib/video/parseVideoSource";
import {
  saveRecordingAction,
  deleteRecordingAction,
  toggleRecordingPublishAction,
  updateRecordingAccessAction,
} from "@/lib/actions/recordings";
import type { Recording, Course, ClassSession, Profile, Enrollment, RecordingAccess } from "@/types/database";

interface EnrichedRecording extends Recording {
  courses?: { id: string; title: string } | null;
  class_sessions?: { id: string; batch_code: string; title: string } | null;
  access_count?: number;
  assigned_student_ids?: string[];
}

interface RecordingsManagerProps {
  initialRecordings: EnrichedRecording[];
  courses: Course[];
  sessions: ClassSession[];
  students: Profile[];
  enrollments: Enrollment[];
  initialAccessList: RecordingAccess[];
}

export default function RecordingsManager({
  initialRecordings,
  courses,
  sessions,
  students,
  enrollments,
  initialAccessList,
}: RecordingsManagerProps) {
  // State
  const [recordings, setRecordings] = useState<EnrichedRecording[]>(initialRecordings);
  const [accessList, setAccessList] = useState<RecordingAccess[]>(initialAccessList);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");

  // Modal / Drawer state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAccessDrawerOpen, setIsAccessDrawerOpen] = useState(false);
  const [activeRecordingForAccess, setActiveRecordingForAccess] = useState<EnrichedRecording | null>(null);

  // Form state
  const [editingRecordingId, setEditingRecordingId] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [courseIdInput, setCourseIdInput] = useState("");
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [classDateInput, setClassDateInput] = useState("");
  const [durationInput, setDurationInput] = useState<number | "">("");
  const [isPublishedInput, setIsPublishedInput] = useState(true);
  const [sortOrderInput, setSortOrderInput] = useState(0);

  // Student selection in form
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [expiresAtInput, setExpiresAtInput] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Live preview & validation state
  const [parsedPreview, setParsedPreview] = useState<ParseVideoOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Map student enrollment to batch codes for badges
  const studentEnrollmentMap = useMemo(() => {
    const map = new Map<string, { batchCodes: string[]; courseTitles: string[] }>();
    enrollments.forEach((e) => {
      const existing = map.get(e.student_id) || { batchCodes: [], courseTitles: [] };
      const session = sessions.find((s) => s.id === e.session_id);
      const course = courses.find((c) => c.id === e.course_id);
      if (session && !existing.batchCodes.includes(session.batch_code)) {
        existing.batchCodes.push(session.batch_code);
      }
      if (course && !existing.courseTitles.includes(course.title)) {
        existing.courseTitles.push(course.title);
      }
      map.set(e.student_id, existing);
    });
    return map;
  }, [enrollments, sessions, courses]);

  // Recalculate access counts on recordings
  const enrichedRecordings = useMemo(() => {
    return recordings.map((rec) => {
      const accesses = accessList.filter((a) => a.recording_id === rec.id);
      return {
        ...rec,
        access_count: accesses.length,
        assigned_student_ids: accesses.map((a) => a.student_id),
      };
    });
  }, [recordings, accessList]);

  // Filter recordings
  const filteredRecordings = useMemo(() => {
    return enrichedRecordings.filter((rec) => {
      const matchesSearch =
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.courses?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.class_sessions?.batch_code?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourse = selectedCourseFilter === "all" || rec.course_id === selectedCourseFilter;
      const matchesBatch = selectedBatchFilter === "all" || rec.session_id === selectedBatchFilter;

      return matchesSearch && matchesCourse && matchesBatch;
    });
  }, [enrichedRecordings, searchQuery, selectedCourseFilter, selectedBatchFilter]);

  // Batches filtered by selected course in form
  const availableBatchesForCourse = useMemo(() => {
    if (!courseIdInput) return sessions;
    return sessions.filter((s) => s.course_id === courseIdInput);
  }, [sessions, courseIdInput]);

  // Instant live URL parser when input changes
  useEffect(() => {
    if (!videoUrlInput.trim()) {
      setParsedPreview(null);
      return;
    }
    const result = parseVideoSource(videoUrlInput);
    setParsedPreview(result);
  }, [videoUrlInput]);

  // Quick Action: Add all students of current batch
  const handleAddAllOfBatch = () => {
    if (!sessionIdInput) {
      alert("Please select a batch first.");
      return;
    }
    const batchStudentIds = enrollments
      .filter((e) => e.session_id === sessionIdInput)
      .map((e) => e.student_id);

    const merged = Array.from(new Set([...selectedStudentIds, ...batchStudentIds]));
    setSelectedStudentIds(merged);
  };

  // Quick Action: Add all students of current course
  const handleAddAllOfCourse = () => {
    if (!courseIdInput) {
      alert("Please select a course first.");
      return;
    }
    const courseStudentIds = enrollments
      .filter((e) => e.course_id === courseIdInput)
      .map((e) => e.student_id);

    const merged = Array.from(new Set([...selectedStudentIds, ...courseStudentIds]));
    setSelectedStudentIds(merged);
  };

  // Filter students in modal checklist
  const visibleStudents = useMemo(() => {
    const q = studentSearchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s) => {
      const enrollInfo = studentEnrollmentMap.get(s.id);
      const inBatches = enrollInfo?.batchCodes.some((b) => b.toLowerCase().includes(q));
      return (
        s.full_name?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        inBatches
      );
    });
  }, [students, studentSearchQuery, studentEnrollmentMap]);

  // Open Create Form
  const openCreateModal = () => {
    setEditingRecordingId(null);
    setVideoUrlInput("");
    setTitleInput("");
    setDescriptionInput("");
    setCourseIdInput(courses[0]?.id || "");
    setSessionIdInput("");
    setClassDateInput(new Date().toISOString().split("T")[0]);
    setDurationInput("");
    setIsPublishedInput(true);
    setSortOrderInput(0);
    setSelectedStudentIds([]);
    setExpiresAtInput("");
    setStudentSearchQuery("");
    setParsedPreview(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Form
  const openEditModal = (rec: EnrichedRecording) => {
    setEditingRecordingId(rec.id);
    setVideoUrlInput(rec.source_url || "");
    setTitleInput(rec.title);
    setDescriptionInput(rec.description || "");
    setCourseIdInput(rec.course_id || "");
    setSessionIdInput(rec.session_id || "");
    setClassDateInput(rec.class_date || "");
    setDurationInput(rec.duration_minutes ?? "");
    setIsPublishedInput(rec.is_published);
    setSortOrderInput(rec.sort_order);

    const existingAccesses = accessList.filter((a) => a.recording_id === rec.id);
    setSelectedStudentIds(existingAccesses.map((a) => a.student_id));
    setExpiresAtInput(
      existingAccesses[0]?.expires_at ? existingAccesses[0].expires_at.split("T")[0] : ""
    );
    setStudentSearchQuery("");
    setIsFormModalOpen(true);
  };

  // Open Access Drawer
  const openAccessDrawer = (rec: EnrichedRecording) => {
    setActiveRecordingForAccess(rec);
    const existing = accessList.filter((a) => a.recording_id === rec.id);
    setSelectedStudentIds(existing.map((a) => a.student_id));
    setExpiresAtInput(existing[0]?.expires_at ? existing[0].expires_at.split("T")[0] : "");
    setIsAccessDrawerOpen(true);
  };

  // Save Form (Create or Update)
  const handleSaveRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      setToastMessage({ type: "error", text: "Please enter a class recording title." });
      return;
    }
    if (!videoUrlInput.trim()) {
      setToastMessage({ type: "error", text: "Please enter a valid video URL or embed code." });
      return;
    }

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const payload = {
        id: editingRecordingId || undefined,
        title: titleInput.trim(),
        description: descriptionInput.trim() || undefined,
        course_id: courseIdInput || undefined,
        session_id: sessionIdInput || undefined,
        class_date: classDateInput || undefined,
        video_url: videoUrlInput.trim(),
        duration_minutes: durationInput === "" ? null : Number(durationInput),
        is_published: isPublishedInput,
        sort_order: Number(sortOrderInput),
        student_ids: selectedStudentIds,
        expires_at: expiresAtInput ? new Date(expiresAtInput).toISOString() : null,
      };

      const res = await saveRecordingAction(payload);
      if (res.success && res.id) {
        setToastMessage({
          type: "success",
          text: editingRecordingId ? "Recording updated successfully." : "Recording created with student access.",
        });

        // Update local state
        const updatedCourse = courses.find((c) => c.id === courseIdInput);
        const updatedSession = sessions.find((s) => s.id === sessionIdInput);
        const parsed = parseVideoSource(videoUrlInput);

        const newRec: EnrichedRecording = {
          id: res.id,
          title: titleInput,
          description: descriptionInput || null,
          course_id: courseIdInput || null,
          session_id: sessionIdInput || null,
          class_date: classDateInput || null,
          source_type: parsed.success ? parsed.source_type : "other_embed",
          source_url: videoUrlInput,
          embed_src: parsed.success ? parsed.embed_src : null,
          video_id: parsed.success ? parsed.video_id : null,
          thumbnail_url: parsed.success ? parsed.thumbnail_url : null,
          duration_minutes: durationInput === "" ? null : Number(durationInput),
          is_published: isPublishedInput,
          sort_order: Number(sortOrderInput),
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          courses: updatedCourse ? { id: updatedCourse.id, title: updatedCourse.title } : null,
          class_sessions: updatedSession
            ? { id: updatedSession.id, batch_code: updatedSession.batch_code, title: updatedSession.title }
            : null,
        };

        if (editingRecordingId) {
          setRecordings((prev) => prev.map((r) => (r.id === res.id ? newRec : r)));
        } else {
          setRecordings((prev) => [newRec, ...prev]);
        }

        // Update access list locally
        setAccessList((prev) => {
          const filtered = prev.filter((a) => a.recording_id !== res.id);
          const newAccesses: RecordingAccess[] = selectedStudentIds.map((sId) => ({
            recording_id: res.id as string,
            student_id: sId,
            granted_by: null,
            granted_at: new Date().toISOString(),
            expires_at: expiresAtInput ? new Date(expiresAtInput).toISOString() : null,
          }));
          return [...filtered, ...newAccesses];
        });

        setIsFormModalOpen(false);
      } else {
        setToastMessage({ type: "error", text: res.error || "Failed to save recording." });
      }
    } catch (err: unknown) {
      setToastMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred while saving recording.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Publication
  const handleTogglePublish = async (recording: EnrichedRecording) => {
    try {
      const res = await toggleRecordingPublishAction(recording.id, recording.is_published);
      if (res.success) {
        setRecordings((prev) =>
          prev.map((r) => (r.id === recording.id ? { ...r, is_published: !r.is_published } : r))
        );
        setToastMessage({
          type: "success",
          text: `Recording "${recording.title}" is now ${!recording.is_published ? "Published" : "Hidden"}.`,
        });
      } else {
        setToastMessage({ type: "error", text: res.error || "Failed to toggle status." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Failed to update publication status." });
    }
  };

  // Delete Recording
  const handleDeleteRecording = async (recording: EnrichedRecording) => {
    if (!confirm(`Are you sure you want to permanently delete "${recording.title}"?`)) {
      return;
    }

    try {
      const res = await deleteRecordingAction(recording.id);
      if (res.success) {
        setRecordings((prev) => prev.filter((r) => r.id !== recording.id));
        setAccessList((prev) => prev.filter((a) => a.recording_id !== recording.id));
        setToastMessage({ type: "success", text: "Recording deleted successfully." });
      } else {
        setToastMessage({ type: "error", text: res.error || "Failed to delete recording." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Failed to delete recording." });
    }
  };

  // Save Access from Drawer
  const handleSaveAccessDrawer = async () => {
    if (!activeRecordingForAccess) return;
    setIsSubmitting(true);

    try {
      const res = await updateRecordingAccessAction({
        recording_id: activeRecordingForAccess.id,
        student_ids: selectedStudentIds,
        expires_at: expiresAtInput ? new Date(expiresAtInput).toISOString() : null,
      });

      if (res.success) {
        setAccessList((prev) => {
          const withoutActive = prev.filter((a) => a.recording_id !== activeRecordingForAccess.id);
          const added: RecordingAccess[] = selectedStudentIds.map((sId) => ({
            recording_id: activeRecordingForAccess.id,
            student_id: sId,
            granted_by: null,
            granted_at: new Date().toISOString(),
            expires_at: expiresAtInput ? new Date(expiresAtInput).toISOString() : null,
          }));
          return [...withoutActive, ...added];
        });

        setToastMessage({ type: "success", text: "Student access permissions updated." });
        setIsAccessDrawerOpen(false);
      } else {
        setToastMessage({ type: "error", text: res.error || "Failed to update access." });
      }
    } catch (err: unknown) {
      setToastMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update access.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy WhatsApp Share Message
  const handleCopyShareMessage = (recording: EnrichedRecording) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://krishfashionacademy.com";
    const shareUrl = `${origin}/dashboard/recordings/${recording.id}`;
    const text = `New class recording is available: *${recording.title}* at Krish Fashion Academy.\n\nLog in to your student dashboard to watch:\n${shareUrl}`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShareId(recording.id);
      setTimeout(() => setCopiedShareId(null), 3000);
      setToastMessage({ type: "success", text: "WhatsApp share message copied to clipboard!" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-sm border text-xs flex items-center justify-between transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-rose-50 border-rose-300 text-rose-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-charcoal/50 hover:text-charcoal text-xs ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-surface p-4 sm:p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search recordings by title, batch, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-charcoal/20 rounded-sm pl-9 pr-3 py-2 text-xs text-heading placeholder:text-charcoal/40 focus:outline-none focus:border-gold"
            />
          </div>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-surface border border-charcoal/20 rounded-sm px-3 py-2 text-xs text-heading focus:outline-none focus:border-gold"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="bg-surface border border-charcoal/20 rounded-sm px-3 py-2 text-xs text-heading focus:outline-none focus:border-gold"
          >
            <option value="all">All Batches</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.batch_code} ({s.title})
              </option>
            ))}
          </select>
        </div>

        {/* Add Recording Button */}
        <Button onClick={openCreateModal} className="shrink-0 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Class Recording</span>
        </Button>
      </div>

      {/* Recordings List */}
      <div className="bg-surface rounded-sm border border-charcoal/15 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-charcoal/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Film className="w-5 h-5 text-gold-dark" />
            <h3 className="font-serif text-lg sm:text-xl text-charcoal-darkest">
              Class Recordings Catalog
            </h3>
          </div>
          <span className="text-xs text-charcoal-light">
            {filteredRecordings.length} recordings found
          </span>
        </div>

        {filteredRecordings.length === 0 ? (
          <div className="p-12 text-center text-charcoal-light text-sm space-y-3">
            <Video className="w-10 h-10 mx-auto text-charcoal/30 stroke-1" />
            <p className="font-medium text-charcoal">No recordings added yet.</p>
            <p className="text-xs text-charcoal/60 max-w-md mx-auto">
              Click &quot;Add Class Recording&quot; to paste a video link from YouTube, Vimeo, Google Drive,
              Bunny Stream, or Zoom and assign access to your students.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal/10">
            {filteredRecordings.map((rec) => (
              <div
                key={rec.id}
                className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-subtle/40 transition-colors"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  {/* Thumbnail / Provider Badge */}
                  <div className="relative w-28 sm:w-36 h-18 sm:h-22 bg-charcoal-darkest rounded-sm overflow-hidden shrink-0 border border-charcoal/20 flex items-center justify-center">
                    {rec.thumbnail_url ? (
                      <Image
                        src={rec.thumbnail_url}
                        alt={rec.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 112px, 144px"
                      />
                    ) : (
                      <div className="text-center p-2 text-off-white/80">
                        <Video className="w-6 h-6 mx-auto mb-1 text-gold-light" />
                        <span className="text-[9px] uppercase tracking-wider uppercase font-mono block">
                          {rec.source_type}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-charcoal-darkest/90 text-[10px] text-off-white px-1.5 py-0.5 rounded-sm font-mono">
                      {rec.duration_minutes ? `${rec.duration_minutes}m` : rec.source_type}
                    </div>
                  </div>

                  {/* Title & metadata */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="font-medium text-charcoal-darkest text-sm sm:text-base leading-snug truncate">
                        {rec.title}
                      </h4>
                      <Badge variant={rec.is_published ? "success" : "danger"}>
                        {rec.is_published ? "Published" : "Draft"}
                      </Badge>
                      <span className="inline-block text-[10px] uppercase font-mono tracking-wider bg-charcoal/10 text-charcoal px-2 py-0.5 rounded-sm">
                        {rec.source_type.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-light">
                      {rec.courses && <span>Course: {rec.courses.title}</span>}
                      {rec.class_sessions && (
                        <span>
                          Batch: <strong className="text-charcoal">{rec.class_sessions.batch_code}</strong>
                        </span>
                      )}
                      {rec.class_date && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gold-dark" />
                          <span>{formatDate(rec.class_date)}</span>
                        </span>
                      )}
                    </div>

                    {rec.description && (
                      <p className="text-xs text-charcoal-light line-clamp-1 max-w-xl">
                        {rec.description}
                      </p>
                    )}

                    {/* Access Count Pill */}
                    <div className="pt-1 flex items-center space-x-2">
                      <button
                        onClick={() => openAccessDrawer(rec)}
                        className="inline-flex items-center space-x-1 text-[11px] font-medium text-gold-dark hover:underline bg-gold/10 px-2.5 py-1 rounded-sm border border-gold/20"
                      >
                        <Users className="w-3 h-3" />
                        <span>{rec.access_count ?? 0} students have access</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-charcoal/10 w-full md:w-auto justify-end">
                  {/* WhatsApp Share Copy */}
                  <button
                    type="button"
                    onClick={() => handleCopyShareMessage(rec)}
                    title="Copy WhatsApp share text"
                    className="p-2 border border-charcoal/20 rounded-sm hover:border-gold hover:text-gold-dark text-charcoal-light transition-colors text-xs flex items-center space-x-1 bg-surface"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">
                      {copiedShareId === rec.id ? "Copied!" : "WhatsApp Share"}
                    </span>
                  </button>

                  {/* Publish Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(rec)}
                    title={rec.is_published ? "Unpublish recording" : "Publish recording"}
                    className="p-2 border border-charcoal/20 rounded-sm hover:border-gold hover:text-gold-dark text-charcoal-light transition-colors"
                  >
                    {rec.is_published ? (
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  {/* Manage Access */}
                  <button
                    type="button"
                    onClick={() => openAccessDrawer(rec)}
                    title="Manage Student Access"
                    className="p-2 border border-charcoal/20 rounded-sm hover:border-gold hover:text-gold-dark text-charcoal-light transition-colors"
                  >
                    <Users className="w-4 h-4 text-gold-dark" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(rec)}
                    title="Edit Recording"
                    className="p-2 border border-charcoal/20 rounded-sm hover:border-gold hover:text-gold-dark text-charcoal-light transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-charcoal" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteRecording(rec)}
                    title="Delete Recording"
                    className="p-2 border border-rose-200 rounded-sm hover:border-rose-400 text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT RECORDING MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-darkest/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface w-full max-w-3xl rounded-sm border border-charcoal/20 p-5 sm:p-7 shadow-2xl space-y-6 my-8 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <div>
                <h3 className="font-serif text-2xl text-charcoal-darkest">
                  {editingRecordingId ? "Edit Class Recording" : "Add Class Recording"}
                </h3>
                <p className="text-xs text-charcoal-light mt-0.5">
                  Paste any video link or iframe embed code. Only authorized students will be permitted to watch.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-charcoal/40 hover:text-charcoal p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecording} className="space-y-5">
              {/* 1. Video URL / Embed Code with Live Preview */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-darkest">
                  Video URL or Iframe Embed Code *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Paste YouTube, Vimeo, Google Drive, Bunny Stream, Zoom link, or iframe embed code..."
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  className="w-full bg-surface border border-charcoal/20 rounded-sm p-3 text-xs text-heading placeholder:text-charcoal/40 font-mono focus:outline-none focus:border-gold resize-y"
                />

                {/* Validation badge & Live preview container */}
                {parsedPreview && (
                  <div className="mt-2 space-y-3">
                    {parsedPreview.success ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>
                              Source detected: <strong>{parsedPreview.source_type.replace("_", " ").toUpperCase()}</strong>
                            </span>
                          </span>
                          {parsedPreview.video_id && (
                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-sm">
                              ID: {parsedPreview.video_id}
                            </span>
                          )}
                        </div>
                        {parsedPreview.extra_note && (
                          <p className="text-[11px] text-emerald-900 italic">
                            {parsedPreview.extra_note}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-sm flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{parsedPreview.error}</span>
                      </div>
                    )}

                    {/* LIVE PREVIEW PLAYER */}
                    {parsedPreview.success && (
                      <div className="border border-charcoal/20 rounded-sm overflow-hidden bg-charcoal-darkest">
                        <div className="px-3 py-1.5 bg-charcoal/90 text-off-white text-[10px] uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <Play className="w-3 h-3 text-gold-light" />
                            <span>Live Admin Preview</span>
                          </span>
                          <span className="font-mono text-[9px] text-gold-light">
                            {parsedPreview.source_type}
                          </span>
                        </div>

                        {/* Player Frame */}
                        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                          {parsedPreview.source_type === "zoom_link" ? (
                            <div className="text-center p-6 text-off-white/80 space-y-2">
                              <Video className="w-8 h-8 mx-auto text-gold-light" />
                              <p className="text-xs">Zoom Cloud Recording Link</p>
                              <a
                                href={parsedPreview.normalized_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 text-xs bg-gold text-charcoal-darkest px-3 py-1.5 rounded-sm font-medium hover:bg-gold-light"
                              >
                                <span>Open Zoom Recording</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : parsedPreview.source_type === "mp4" || parsedPreview.source_type === "hls" ? (
                            <video
                              src={parsedPreview.embed_src || undefined}
                              controls
                              className="w-full h-full object-contain"
                            />
                          ) : parsedPreview.embed_src ? (
                            <iframe
                              src={parsedPreview.embed_src}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Title & Description */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-darkest mb-1">
                    Recording Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masterclass Lecture 3: Saree Blouse Armhole & Dart Fitting"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-3.5 py-2 text-xs text-heading focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-darkest mb-1">
                    Lesson Description & Student Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide timestamps, tools used, pattern paper measurements, homework instructions..."
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm p-3 text-xs text-heading placeholder:text-charcoal/40 focus:outline-none focus:border-gold resize-y"
                  />
                </div>
              </div>

              {/* 3. Course, Batch, Class Date, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-darkest mb-1">
                    Course
                  </label>
                  <select
                    value={courseIdInput}
                    onChange={(e) => {
                      setCourseIdInput(e.target.value);
                      setSessionIdInput("");
                    }}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-2.5 py-2 text-xs text-heading focus:outline-none focus:border-gold"
                  >
                    <option value="">-- No specific course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-darkest mb-1">
                    Batch
                  </label>
                  <select
                    value={sessionIdInput}
                    onChange={(e) => setSessionIdInput(e.target.value)}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-2.5 py-2 text-xs text-heading focus:outline-none focus:border-gold"
                  >
                    <option value="">-- No specific batch --</option>
                    {availableBatchesForCourse.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.batch_code} ({s.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-darkest mb-1">
                    Class Date
                  </label>
                  <input
                    type="date"
                    value={classDateInput}
                    onChange={(e) => setClassDateInput(e.target.value)}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-2.5 py-2 text-xs text-heading focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-darkest mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 75"
                    value={durationInput}
                    onChange={(e) => setDurationInput(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-2.5 py-2 text-xs text-heading focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Publication toggle & Sort order */}
              <div className="flex flex-wrap items-center justify-between p-3 bg-subtle/50 rounded-sm border border-charcoal/10 gap-3">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublishedInput}
                    onChange={(e) => setIsPublishedInput(e.target.checked)}
                    className="w-4 h-4 text-gold rounded border-charcoal/30 focus:ring-gold"
                  />
                  <span className="text-xs font-medium text-charcoal-darkest">
                    Published (Visible to authorized students immediately)
                  </span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-charcoal-light">Sort Order:</span>
                  <input
                    type="number"
                    value={sortOrderInput}
                    onChange={(e) => setSortOrderInput(Number(e.target.value))}
                    className="w-16 bg-surface border border-charcoal/20 rounded-sm px-2 py-1 text-xs text-heading text-center"
                  />
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION: WHO CAN WATCH (Granular Student Selector) */}
              {/* ================================================================= */}
              <div className="space-y-3 border-t border-charcoal/10 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-serif text-lg text-charcoal-darkest">
                      Who Can Watch This Recording
                    </h4>
                    <p className="text-xs text-charcoal-light">
                      Choose individual students or use the quick actions below to grant access to an entire batch or course.
                    </p>
                  </div>
                  <span className="inline-block bg-gold/15 text-gold-dark font-medium text-xs px-2.5 py-1 rounded-sm border border-gold/30">
                    {selectedStudentIds.length} students selected
                  </span>
                </div>

                {/* Quick actions buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddAllOfBatch}
                    className="px-2.5 py-1.5 text-xs bg-surface border border-charcoal/20 hover:border-gold hover:text-gold-dark rounded-sm transition-colors"
                  >
                    + Add all students of batch
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAllOfCourse}
                    className="px-2.5 py-1.5 text-xs bg-surface border border-charcoal/20 hover:border-gold hover:text-gold-dark rounded-sm transition-colors"
                  >
                    + Add all students of course
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const allVisibleIds = visibleStudents.map((s) => s.id);
                      setSelectedStudentIds(Array.from(new Set([...selectedStudentIds, ...allVisibleIds])));
                    }}
                    className="px-2.5 py-1.5 text-xs bg-surface border border-charcoal/20 hover:border-gold rounded-sm transition-colors"
                  >
                    Select all shown
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="px-2.5 py-1.5 text-xs bg-surface border border-charcoal/20 text-rose-600 hover:border-rose-400 rounded-sm transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Optional Expiry Date */}
                <div className="p-3 bg-subtle/30 rounded-sm border border-charcoal/10 flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs text-charcoal font-medium">Access Expiry Date (Optional):</span>
                  <input
                    type="date"
                    value={expiresAtInput}
                    onChange={(e) => setExpiresAtInput(e.target.value)}
                    className="bg-surface border border-charcoal/20 rounded-sm px-3 py-1.5 text-xs text-heading"
                  />
                  <span className="text-[11px] text-charcoal-light">
                    Leave blank for permanent student access.
                  </span>
                </div>

                {/* Searchable Student Checklist */}
                <div className="border border-charcoal/15 rounded-sm overflow-hidden bg-surface">
                  <div className="p-2 border-b border-charcoal/10 bg-subtle/20 flex items-center space-x-2">
                    <Search className="w-3.5 h-3.5 text-charcoal/40 ml-1" />
                    <input
                      type="text"
                      placeholder="Search students by name, batch, or phone..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-heading placeholder:text-charcoal/40 focus:outline-none"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-charcoal/10">
                    {visibleStudents.length === 0 ? (
                      <div className="p-4 text-center text-xs text-charcoal-light">
                        No students found matching &quot;{studentSearchQuery}&quot;
                      </div>
                    ) : (
                      visibleStudents.map((student) => {
                        const isChecked = selectedStudentIds.includes(student.id);
                        const enrollInfo = studentEnrollmentMap.get(student.id);

                        return (
                          <label
                            key={student.id}
                            className={`flex items-center justify-between p-2.5 hover:bg-subtle/50 cursor-pointer text-xs ${
                              isChecked ? "bg-gold/5" : ""
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentIds([...selectedStudentIds, student.id]);
                                  } else {
                                    setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                                  }
                                }}
                                className="w-4 h-4 text-gold rounded border-charcoal/30 focus:ring-gold"
                              />
                              <div>
                                <span className="font-medium text-charcoal-darkest block">
                                  {student.full_name}
                                </span>
                                <span className="text-[11px] text-charcoal-light">
                                  {student.phone || "No phone"}
                                </span>
                              </div>
                            </div>

                            {/* Batch Chips */}
                            <div className="flex flex-wrap items-center gap-1 justify-end max-w-xs">
                              {enrollInfo?.batchCodes && enrollInfo.batchCodes.length > 0 ? (
                                enrollInfo.batchCodes.map((bc) => (
                                  <span
                                    key={bc}
                                    className="text-[10px] bg-charcoal/10 text-charcoal px-1.5 py-0.5 rounded-sm font-mono"
                                  >
                                    {bc}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-charcoal/40 italic">Not in batch</span>
                              )}
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingRecordingId ? "Save Changes" : "Save & Grant Access"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANAGE ACCESS DRAWER */}
      {/* ========================================================================= */}
      {isAccessDrawerOpen && activeRecordingForAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-charcoal-darkest/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface w-full max-w-md h-full border-l border-charcoal/20 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gold-dark" />
                  <h3 className="font-serif text-xl text-charcoal-darkest">Manage Student Access</h3>
                </div>
                <button
                  onClick={() => setIsAccessDrawerOpen(false)}
                  className="text-charcoal/40 hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-subtle/50 rounded-sm text-xs space-y-1">
                <p className="font-medium text-charcoal-darkest">{activeRecordingForAccess.title}</p>
                <p className="text-charcoal-light text-[11px]">
                  Batch: {activeRecordingForAccess.class_sessions?.batch_code || "General"}
                </p>
              </div>

              {/* Optional Expiry Date */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal-darkest">
                  Access Expiration Date
                </label>
                <input
                  type="date"
                  value={expiresAtInput}
                  onChange={(e) => setExpiresAtInput(e.target.value)}
                  className="w-full bg-surface border border-charcoal/20 rounded-sm px-3 py-1.5 text-xs text-heading"
                />
              </div>

              {/* Search & Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-charcoal">Assigned Students:</span>
                  <span className="text-gold-dark font-medium">{selectedStudentIds.length} allowed</span>
                </div>

                <div className="border border-charcoal/20 rounded-sm overflow-hidden">
                  <div className="p-2 border-b border-charcoal/10 bg-subtle/20 flex items-center space-x-2">
                    <Search className="w-3.5 h-3.5 text-charcoal/40" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-heading placeholder:text-charcoal/40 focus:outline-none"
                    />
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-charcoal/10">
                    {visibleStudents.map((student) => {
                      const isChecked = selectedStudentIds.includes(student.id);
                      return (
                        <label
                          key={student.id}
                          className={`flex items-center justify-between p-2.5 hover:bg-subtle/50 cursor-pointer text-xs ${
                            isChecked ? "bg-gold/5" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds([...selectedStudentIds, student.id]);
                                } else {
                                  setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                                }
                              }}
                              className="w-4 h-4 text-gold rounded border-charcoal/30 focus:ring-gold"
                            />
                            <span className="font-medium text-charcoal-darkest">
                              {student.full_name}
                            </span>
                          </div>
                          <span className="text-[10px] text-charcoal-light">
                            {student.phone || "No phone"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10 mt-6">
              <button
                type="button"
                onClick={() => setIsAccessDrawerOpen(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal"
              >
                Cancel
              </button>
              <Button onClick={handleSaveAccessDrawer} isLoading={isSubmitting}>
                Save Access
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

