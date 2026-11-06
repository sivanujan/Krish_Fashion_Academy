"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setErrorMsg(null);
    try {
      const res = await resetPasswordAction(data);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrorMsg(res.error || "Failed to update password");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="font-serif text-2xl text-off-white font-medium">
          Create New Password
        </h1>
        <p className="text-xs text-off-white/60 mt-1">
          Enter your new secure password below
        </p>
      </div>

      {success ? (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-6 rounded-sm text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <h3 className="font-serif text-lg text-emerald-200">
            Password Updated
          </h3>
          <p className="text-xs text-emerald-300 mt-2">
            Redirecting to sign-in portal...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs rounded-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Input
            id="password"
            type="password"
            label="New Password"
            placeholder="••••••••"
            error={errors.password?.message}
            className="bg-charcoal-darkest border-charcoal/80 text-off-white placeholder:text-off-white/30 focus:border-gold"
            {...register("password")}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            className="bg-charcoal-darkest border-charcoal/80 text-off-white placeholder:text-off-white/30 focus:border-gold"
            {...register("confirmPassword")}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
            Save & Update Password
          </Button>
        </form>
      )}
    </div>
  );
}
