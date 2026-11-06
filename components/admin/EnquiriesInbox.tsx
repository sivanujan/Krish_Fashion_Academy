"use client";

import { useState } from "react";
import { updateEnquiryStatusAction, deleteEnquiryAction } from "@/lib/actions/enquiries";
import { enrollParticipantAction } from "@/lib/actions/batches";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate, getWhatsAppUrl } from "@/lib/utils";
import type { Enquiry } from "@/types/database";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  UserCheck,
  Save,
  AlertCircle,
  X,
} from "lucide-react";

export interface BatchOption {
  id: string;
  batch_code: string;
  title: string;
  course_id: string;
  start_date: string | null;
}

interface EnquiriesInboxProps {
  initialEnquiries: Enquiry[];
  availableBatches?: BatchOption[];
}

export default function EnquiriesInbox({
  initialEnquiries,
  availableBatches = [],
}: EnquiriesInboxProps) {
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "registered" | "closed">("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(
    initialEnquiries[0] || null
  );
  const [adminNoteInput, setAdminNoteInput] = useState(
    initialEnquiries[0]?.admin_note || ""
  );
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaveStatus, setNoteSaveStatus] = useState<string | null>(null);

  // Convert to Participant Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertBatchId, setConvertBatchId] = useState(
    selectedEnquiry?.interested_session_id || availableBatches[0]?.id || ""
  );
  const [convertName, setConvertName] = useState("");
  const [convertEmail, setConvertEmail] = useState("");
  const [convertPhone, setConvertPhone] = useState("");
  const [convertMode, setConvertMode] = useState<"in_person" | "online">("in_person");
  const [convertPaymentStatus, setConvertPaymentStatus] = useState<
    "unpaid" | "paid" | "waived" | "refunded"
  >("unpaid");
  const [convertAmountPaid, setConvertAmountPaid] = useState<number | "">("");
  const [isSubmittingConvert, setIsSubmittingConvert] = useState(false);
  const [convertSuccessMsg, setConvertSuccessMsg] = useState<string | null>(null);
  const [convertErrorMsg, setConvertErrorMsg] = useState<string | null>(null);

  const filtered = initialEnquiries.filter((e) => {
    if (filter === "all") return true;
    const s = e.status || (e.is_read ? "contacted" : "new");
    return s === filter;
  });

  const handleSelectEnquiry = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setAdminNoteInput(enq.admin_note || "");
    setNoteSaveStatus(null);
  };

  const handleStatusChange = async (
    enquiryId: string,
    newStatus: "new" | "contacted" | "registered" | "closed"
  ) => {
    const res = await updateEnquiryStatusAction(enquiryId, newStatus, adminNoteInput);
    if (res.success && selectedEnquiry?.id === enquiryId) {
      setSelectedEnquiry({
        ...selectedEnquiry,
        status: newStatus,
        is_read: true,
      });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedEnquiry) return;
    setIsSavingNote(true);
    setNoteSaveStatus(null);
    try {
      const currentStatus = (selectedEnquiry.status as "new" | "contacted" | "registered" | "closed") || "contacted";
      const res = await updateEnquiryStatusAction(selectedEnquiry.id, currentStatus, adminNoteInput);
      if (res.success) {
        setNoteSaveStatus("Note saved!");
        setSelectedEnquiry({ ...selectedEnquiry, admin_note: adminNoteInput });
        setTimeout(() => setNoteSaveStatus(null), 3000);
      } else {
        setNoteSaveStatus("Failed to save note");
      }
    } catch {
      setNoteSaveStatus("Error saving note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete enquiry from "${name}"?`)) return;
    await deleteEnquiryAction(id);
    if (selectedEnquiry?.id === id) {
      const remaining = initialEnquiries.filter((e) => e.id !== id);
      setSelectedEnquiry(remaining[0] || null);
    }
  };

  const openConvertModal = () => {
    if (!selectedEnquiry) return;
    setConvertName(selectedEnquiry.name);
    setConvertEmail(selectedEnquiry.email || "");
    setConvertPhone(selectedEnquiry.phone);
    setConvertMode(selectedEnquiry.preferred_mode === "online" ? "online" : "in_person");
    setConvertBatchId(
      selectedEnquiry.interested_session_id || availableBatches[0]?.id || ""
    );
    setConvertSuccessMsg(null);
    setConvertErrorMsg(null);
    setIsConvertModalOpen(true);
  };

  const handleConfirmConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setIsSubmittingConvert(true);
    setConvertErrorMsg(null);

    const chosenBatch = availableBatches.find((b) => b.id === convertBatchId);
    if (!chosenBatch) {
      setConvertErrorMsg("Please choose a valid batch.");
      setIsSubmittingConvert(false);
      return;
    }

    if (!convertEmail.trim()) {
      setConvertErrorMsg("Email address is required to create a student portal account.");
      setIsSubmittingConvert(false);
      return;
    }

    try {
      const enrollRes = await enrollParticipantAction({
        sessionId: chosenBatch.id,
        courseId: chosenBatch.course_id,
        newStudent: {
          fullName: convertName.trim(),
          email: convertEmail.trim(),
          phone: convertPhone.trim() || undefined,
          tempPassword: "KFA" + Math.floor(1000 + Math.random() * 9000) + "!",
        },
        attendanceMode: convertMode,
        paymentStatus: convertPaymentStatus,
        amountPaidCad: typeof convertAmountPaid === "number" ? convertAmountPaid : undefined,
        paymentNote: `Converted from public enquiry #${selectedEnquiry.id.slice(0, 8)}`,
      });

      if (!enrollRes.success) {
        setConvertErrorMsg(enrollRes.error || "Failed to enroll participant.");
        setIsSubmittingConvert(false);
        return;
      }

      // Update enquiry status to 'registered' and note the batch
      const updatedNote = `${adminNoteInput ? adminNoteInput + "\n" : ""}Converted to student in batch ${chosenBatch.batch_code} on ${new Date().toLocaleDateString("en-CA")}`;
      await updateEnquiryStatusAction(selectedEnquiry.id, "registered", updatedNote);

      setSelectedEnquiry({
        ...selectedEnquiry,
        status: "registered",
        admin_note: updatedNote,
      });
      setAdminNoteInput(updatedNote);

      setConvertSuccessMsg(
        `Successfully enrolled ${convertName} into ${chosenBatch.batch_code}!`
      );
      setTimeout(() => {
        setIsConvertModalOpen(false);
        setConvertSuccessMsg(null);
      }, 2000);
    } catch (err: unknown) {
      setConvertErrorMsg(
        err instanceof Error ? err.message : "Failed to convert enquiry."
      );
    } finally {
      setIsSubmittingConvert(false);
    }
  };

  const getStatusBadge = (status: string | null | undefined, isRead: boolean) => {
    const s = status || (isRead ? "contacted" : "new");
    switch (s) {
      case "new":
        return <Badge variant="gold">New Lead</Badge>;
      case "contacted":
        return <Badge variant="neutral">Contacted</Badge>;
      case "registered":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            Registered
          </span>
        );
      case "closed":
        return <Badge variant="neutral">Closed</Badge>;
      default:
        return <Badge variant="neutral">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-surface p-4 rounded-sm border border-charcoal/15 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {(["all", "new", "contacted", "registered", "closed"] as const).map((s) => {
            const count =
              s === "all"
                ? initialEnquiries.length
                : initialEnquiries.filter((e) => (e.status || (e.is_read ? "contacted" : "new")) === s).length;

            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-medium transition-colors ${
                  filter === s
                    ? "bg-charcoal text-off-white"
                    : "text-charcoal-light hover:text-charcoal bg-subtle"
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Enquiries List */}
        <div className="lg:col-span-6 bg-surface rounded-sm border border-charcoal/15 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-charcoal-light text-sm">
              No enquiries match the current filter.
            </div>
          ) : (
            <div className="divide-y divide-charcoal/10 max-h-[800px] overflow-y-auto">
              {filtered.map((enq) => {
                const isSelected = selectedEnquiry?.id === enq.id;
                const enqStatus = enq.status || (enq.is_read ? "contacted" : "new");

                return (
                  <div
                    key={enq.id}
                    onClick={() => handleSelectEnquiry(enq)}
                    className={`p-5 cursor-pointer transition-colors hover:bg-subtle/50 ${
                      isSelected ? "bg-gold/10 border-l-4 border-gold" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-base text-charcoal-darkest">
                          {enq.name}
                        </span>
                        {enqStatus === "new" && (
                          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] text-charcoal-light">
                        {formatDate(enq.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gold-dark font-medium truncate max-w-[200px]">
                        {enq.course_interest || "Saree Blouse Master Class"}
                      </span>
                      {getStatusBadge(enq.status, enq.is_read)}
                    </div>

                    <p className="text-xs text-charcoal-light line-clamp-2 font-light">
                      {enq.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal-light/70 pt-2 border-t border-charcoal/5">
                      <span>{enq.phone}</span>
                      {enq.preferred_mode && (
                        <span className="capitalize">{enq.preferred_mode.replace("_", " ")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Enquiry Detail Panel */}
        <div className="lg:col-span-6 bg-surface rounded-sm border border-charcoal/15 shadow-sm p-6 space-y-6 sticky top-24">
          {selectedEnquiry ? (
            <>
              <div className="flex items-start justify-between border-b border-charcoal/10 pb-4">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal-darkest">
                    {selectedEnquiry.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-charcoal-light mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Received: {formatDate(selectedEnquiry.created_at)}</span>
                  </div>
                </div>

                <div className="text-right">
                  {getStatusBadge(selectedEnquiry.status, selectedEnquiry.is_read)}
                </div>
              </div>

              {/* Status Workflow Selector */}
              <div className="bg-subtle p-3 rounded-sm border border-charcoal/10 space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-light block">
                  Workflow Status:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["new", "contacted", "registered", "closed"] as const).map((s) => {
                    const currentStatus =
                      selectedEnquiry.status || (selectedEnquiry.is_read ? "contacted" : "new");
                    const isActive = currentStatus === s;

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleStatusChange(selectedEnquiry.id, s)}
                        className={`py-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-all ${
                          isActive
                            ? s === "new"
                              ? "bg-gold text-charcoal-darkest shadow-xs"
                              : s === "contacted"
                              ? "bg-blue-600 text-white shadow-xs"
                              : s === "registered"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-charcoal text-off-white shadow-xs"
                            : "bg-surface hover:bg-white text-charcoal-light border border-charcoal/10"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="space-y-2.5 bg-subtle p-4 rounded-sm text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light font-medium uppercase tracking-wider">
                    Phone / WhatsApp:
                  </span>
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="text-heading font-medium hover:text-gold"
                  >
                    {selectedEnquiry.phone}
                  </a>
                </div>

                {selectedEnquiry.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-light font-medium uppercase tracking-wider">
                      Email:
                    </span>
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="text-heading font-medium hover:text-gold"
                    >
                      {selectedEnquiry.email}
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light font-medium uppercase tracking-wider">
                    Course Interest:
                  </span>
                  <span className="text-gold-dark font-medium">
                    {selectedEnquiry.course_interest || "2-Day Saree Blouse Master Class"}
                  </span>
                </div>

                {selectedEnquiry.preferred_mode && (
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-light font-medium uppercase tracking-wider">
                      Preferred Mode:
                    </span>
                    <span className="capitalize font-medium text-heading">
                      {selectedEnquiry.preferred_mode.replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-charcoal-light font-semibold mb-1.5">
                  Inquiry Message:
                </span>
                <div className="p-4 bg-white border border-charcoal/10 rounded-sm text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-line">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Admin Note Section */}
              <div className="space-y-2 pt-2 border-t border-charcoal/10">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-charcoal-light font-semibold">
                    Krish&apos;s Private Notes:
                  </label>
                  {noteSaveStatus && (
                    <span className="text-[11px] text-emerald-600 font-medium">
                      {noteSaveStatus}
                    </span>
                  )}
                </div>
                <Textarea
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Record call outcome, batch preference, deposit details, etc."
                  rows={3}
                  className="text-xs"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="text-xs"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    <span>{isSavingNote ? "Saving..." : "Save Note"}</span>
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-charcoal/10">
                {/* One-click WhatsApp Reply */}
                <a
                  href={getWhatsAppUrl(
                    selectedEnquiry.phone,
                    `Hello ${selectedEnquiry.name}, this is Krish from Krish Fashion Academy in Scarborough regarding your enquiry about our 2-Day Saree Blouse Master Class!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply via WhatsApp</span>
                </a>

                {/* Convert to Participant Button */}
                <button
                  type="button"
                  onClick={openConvertModal}
                  className="w-full flex items-center justify-center space-x-2 bg-charcoal hover:bg-charcoal-light text-off-white py-2.5 px-4 rounded-sm text-xs uppercase tracking-wider font-medium transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-gold" />
                  <span>Convert to Participant</span>
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedEnquiry.id,
                        selectedEnquiry.status === "closed" ? "contacted" : "closed"
                      )
                    }
                    className="text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal underline font-medium"
                  >
                    {selectedEnquiry.status === "closed" ? "Reopen Lead" : "Close Enquiry"}
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(selectedEnquiry.id, selectedEnquiry.name)
                    }
                    className="text-xs uppercase tracking-wider text-rose-600 hover:text-rose-800 underline font-medium"
                  >
                    Delete Message
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-charcoal-light text-xs">
              Select an enquiry from the list to view details, update workflow status, or convert to a participant.
            </div>
          )}
        </div>
      </div>

      {/* Convert to Participant Modal */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface rounded-sm border border-gold/40 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold-dark font-semibold block">
                  Admissions Pipeline
                </span>
                <h3 className="font-serif text-2xl text-charcoal-darkest">
                  Convert Lead to Participant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="text-charcoal-light hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {convertSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-sm text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{convertSuccessMsg}</span>
              </div>
            )}

            {convertErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-sm text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{convertErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleConfirmConvert} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                  Target Batch *
                </label>
                <select
                  value={convertBatchId}
                  onChange={(e) => setConvertBatchId(e.target.value)}
                  className="w-full bg-surface border border-charcoal/20 px-3 py-2 text-xs rounded-sm focus:border-gold outline-none"
                  required
                >
                  {availableBatches.length === 0 ? (
                    <option value="">No published batches found</option>
                  ) : (
                    availableBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_code} — {b.title} ({b.start_date || "Date TBA"})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                    Student Full Name *
                  </label>
                  <Input
                    value={convertName}
                    onChange={(e) => setConvertName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={convertPhone}
                    onChange={(e) => setConvertPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                  Email Address (Student Portal Login) *
                </label>
                <Input
                  type="email"
                  value={convertEmail}
                  onChange={(e) => setConvertEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                />
                <p className="text-[10px] text-charcoal-light mt-1">
                  A student portal account will be automatically created with password template <code className="text-gold-dark font-mono">KFA****!</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                    Attendance Mode
                  </label>
                  <select
                    value={convertMode}
                    onChange={(e) => setConvertMode(e.target.value as "in_person" | "online")}
                    className="w-full bg-surface border border-charcoal/20 px-3 py-2 text-xs rounded-sm focus:border-gold outline-none"
                  >
                    <option value="in_person">In-person (Scarborough Studio)</option>
                    <option value="online">Online (Live Class)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                    Initial Payment Status
                  </label>
                  <select
                    value={convertPaymentStatus}
                    onChange={(e) =>
                      setConvertPaymentStatus(
                        e.target.value as "unpaid" | "paid" | "waived" | "refunded"
                      )
                    }
                    className="w-full bg-surface border border-charcoal/20 px-3 py-2 text-xs rounded-sm focus:border-gold outline-none"
                  >
                    <option value="unpaid">Unpaid (Awaiting Interac / Cash)</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived / Complimentary</option>
                  </select>
                </div>
              </div>

              {convertPaymentStatus === "paid" && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                    Amount Paid (CAD $)
                  </label>
                  <Input
                    type="number"
                    value={convertAmountPaid}
                    onChange={(e) =>
                      setConvertAmountPaid(
                        e.target.value === "" ? "" : parseFloat(e.target.value)
                      )
                    }
                    placeholder="e.g. 250"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-charcoal/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConvertModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingConvert || availableBatches.length === 0}
                >
                  {isSubmittingConvert ? "Enrolling..." : "Enroll as Participant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}