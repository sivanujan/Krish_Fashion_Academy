"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations/auth";
import { updateProfileAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, User } from "lucide-react";

interface StudentProfileFormProps {
  initialName: string;
  initialPhone?: string;
  email: string;
}

export default function StudentProfileForm({
  initialName,
  initialPhone = "",
  email,
}: StudentProfileFormProps) {
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: initialName,
      phone: initialPhone,
      newPassword: "",
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    setErrorMsg(null);
    setSuccessMsg(false);
    try {
      const res = await updateProfileAction(
        data.full_name,
        data.phone,
        data.newPassword || undefined
      );

      if (res.success) {
        setSuccessMsg(true);
        reset({ ...data, newPassword: "" });
      } else {
        setErrorMsg(res.error || "Failed to update profile");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    }
  };

  return (
    <div className="bg-surface rounded-sm border border-charcoal/15 p-6 sm:p-8 max-w-2xl shadow-sm">
      <div className="flex items-center space-x-3 pb-6 border-b border-charcoal/10 mb-6">
        <div className="w-12 h-12 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center font-serif text-xl">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-charcoal-darkest">
            Personal Information
          </h2>
          <p className="text-xs text-charcoal-light">{email}</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 mb-6 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Legal Name"
          id="full_name"
          placeholder="e.g. Priyantha Silva"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <Input
          label="Phone / WhatsApp Contact"
          id="phone"
          placeholder="e.g. +1 647-501-9569"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <div className="pt-4 border-t border-charcoal/10">
          <h3 className="font-serif text-lg text-charcoal-darkest mb-1">
            Change Password
          </h3>
          <p className="text-xs text-charcoal-light mb-3">
            Leave blank if you do not wish to change your password.
          </p>

          <Input
            label="New Password"
            id="newPassword"
            type="password"
            placeholder="Minimum 6 characters"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
