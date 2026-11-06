"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, type StudentInput } from "@/lib/validations/course";
import { createStudentAction, toggleStudentStatusAction } from "@/lib/actions/students";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { UserPlus, Search, Phone, Mail, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

interface StudentsManagerProps {
  initialStudents: Profile[];
}

export default function StudentsManager({
  initialStudents,
}: StudentsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const filtered = initialStudents.filter((student) => {
    const q = searchTerm.toLowerCase();
    return (
      student.full_name?.toLowerCase().includes(q) ||
      student.phone?.toLowerCase().includes(q)
    );
  });

  const onSubmit = async (data: StudentInput) => {
    setErrorMsg(null);
    setSuccessInfo(null);
    try {
      const res = await createStudentAction(data);
      if (res.success) {
        setSuccessInfo(`Account provisioned successfully for ${data.full_name} (${data.email}). Provide them with the temporary password.`);
        reset();
      } else {
        setErrorMsg(res.error || "Failed to create student account");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    }
  };

  const handleToggleStatus = async (studentId: string, currentStatus: boolean, name: string) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} account for ${name}?`)) return;
    await toggleStudentStatusAction(studentId, currentStatus);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-charcoal/40" />
          <input
            type="text"
            placeholder="Search students by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-charcoal/20 rounded-sm pl-10 pr-4 py-2 text-xs text-heading placeholder:text-charcoal/40 focus:outline-none focus:border-gold"
          />
        </div>

        <Button onClick={() => { setIsModalOpen(true); setSuccessInfo(null); setErrorMsg(null); }}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          <span>Provision Student Account</span>
        </Button>
      </div>

      {/* Students Table */}
      <div className="bg-surface rounded-sm border border-charcoal/15 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-charcoal/10 flex items-center justify-between">
          <h3 className="font-serif text-xl text-charcoal-darkest">
            Enrolled Student Directory
          </h3>
          <span className="text-xs text-charcoal-light">
            {filtered.length} students found
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-charcoal-light text-sm">
            No students found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-charcoal font-medium uppercase tracking-wider border-b border-charcoal/10">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-heading text-sm">
                      {student.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-light">
                      {student.phone || "No phone registered"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={student.is_active ? "success" : "danger"}>
                        {student.is_active ? "Active" : "Deactivated"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-light">
                      {formatDate(student.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(
                            student.id,
                            student.is_active,
                            student.full_name
                          )
                        }
                        className={`text-xs uppercase tracking-wider font-medium hover:underline ${
                          student.is_active
                            ? "text-rose-600 hover:text-rose-800"
                            : "text-emerald-600 hover:text-emerald-800"
                        }`}
                      >
                        {student.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-darkest/75 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-sm border border-charcoal/20 p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in">
            <div>
              <h3 className="font-serif text-2xl text-charcoal-darkest">
                Provision Student Account
              </h3>
              <p className="text-xs text-charcoal-light mt-1">
                Creates an authenticated Supabase user via Service Role key with confirmed email.
              </p>
            </div>

            {successInfo && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successInfo}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Legal Name *"
                placeholder="e.g. Shalini Perera"
                error={errors.full_name?.message}
                {...register("full_name")}
              />

              <Input
                label="Student Email Address *"
                type="email"
                placeholder="student@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Phone / WhatsApp Contact"
                placeholder="e.g. +1 647-501-9569"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <Input
                label="Temporary Password *"
                type="text"
                placeholder="Minimum 6 characters (e.g. KFAstudent2026!)"
                error={errors.password?.message}
                {...register("password")}
              />

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal"
                >
                  Close
                </button>
                <Button type="submit" isLoading={isSubmitting}>
                  Create Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
