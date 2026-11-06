"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enrollmentSchema, type EnrollmentInput } from "@/lib/validations/course";
import { assignEnrollmentAction, deleteEnrollmentAction } from "@/lib/actions/enrollments";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Profile, Course } from "@/types/database";
import { UserCheck, Plus, Trash2, AlertCircle } from "lucide-react";

interface EnrollmentItem {
  id: string;
  status: "active" | "expired";
  expires_at: string | null;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    phone: string | null;
  };
  courses: {
    id: string;
    title: string;
  };
}

interface EnrollmentsManagerProps {
  students: Profile[];
  courses: Course[];
  initialEnrollments: EnrollmentItem[];
}

export default function EnrollmentsManager({
  students,
  courses,
  initialEnrollments,
}: EnrollmentsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnrollmentInput>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      student_id: students[0]?.id || "",
      course_id: courses[0]?.id || "",
      status: "active",
      expires_at: "",
    },
  });

  const onSubmit = async (data: EnrollmentInput) => {
    setErrorMsg(null);
    try {
      const res = await assignEnrollmentAction({
        ...data,
        expires_at: data.expires_at || null,
      });

      if (res.success) {
        setIsModalOpen(false);
        reset();
      } else {
        setErrorMsg(res.error || "Failed to assign enrollment");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    }
  };

  const handleRemove = async (enrollmentId: string, studentName: string, courseTitle: string) => {
    if (!confirm(`Revoke enrollment for "${studentName}" in "${courseTitle}"?`)) return;
    await deleteEnrollmentAction(enrollmentId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-darkest">
            Course Enrollments
          </h2>
          <p className="text-xs text-charcoal-light mt-0.5">
            Grant students access to classroom lessons, schedules, and materials.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Assign Course Access</span>
        </Button>
      </div>

      <div className="bg-surface rounded-sm border border-charcoal/15 shadow-sm overflow-hidden">
        {initialEnrollments.length === 0 ? (
          <div className="p-12 text-center text-charcoal-light text-sm">
            No student enrollments found. Click &quot;Assign Course Access&quot; to enroll your first student.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-charcoal font-medium uppercase tracking-wider border-b border-charcoal/10">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Enrolled Masterclass</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Access Expiry</th>
                  <th className="py-3 px-4">Assigned On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {initialEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-heading text-sm">
                        {enr.profiles?.full_name || "Unknown"}
                      </p>
                      {enr.profiles?.phone && (
                        <p className="text-[11px] text-charcoal-light">
                          {enr.profiles.phone}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-heading">
                      {enr.courses?.title || "Unknown Course"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={enr.status === "active" ? "success" : "danger"}>
                        {enr.status === "active" ? "Active Access" : "Expired"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-light">
                      {enr.expires_at ? formatDate(enr.expires_at) : "Lifetime / Permanent"}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-light">
                      {formatDate(enr.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            enr.id,
                            enr.profiles?.full_name,
                            enr.courses?.title
                          )
                        }
                        title="Revoke Enrollment"
                        className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors"
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-darkest/75 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-sm border border-charcoal/20 p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in">
            <h3 className="font-serif text-2xl text-charcoal-darkest">
              Assign Course Enrollment
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal font-medium mb-1.5">
                  Select Student *
                </label>
                <select
                  className="w-full bg-surface border border-charcoal/20 rounded-sm px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-gold"
                  {...register("student_id")}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} {s.phone ? `(${s.phone})` : ""}
                    </option>
                  ))}
                </select>
                {errors.student_id && (
                  <p className="mt-1 text-xs text-rose-600">{errors.student_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal font-medium mb-1.5">
                  Select Course *
                </label>
                <select
                  className="w-full bg-surface border border-charcoal/20 rounded-sm px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-gold"
                  {...register("course_id")}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {errors.course_id && (
                  <p className="mt-1 text-xs text-rose-600">{errors.course_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal font-medium mb-1.5">
                    Enrollment Status
                  </label>
                  <select
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-gold"
                    {...register("status")}
                  >
                    <option value="active">Active Access</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <Input
                  label="Expiry Date (Optional)"
                  type="date"
                  error={errors.expires_at?.message}
                  {...register("expires_at")}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={isSubmitting}>
                  Confirm Enrollment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
