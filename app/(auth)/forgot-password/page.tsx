"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setErrorMsg(null);
    try {
      const res = await forgotPasswordAction(data);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || "Failed to send reset link");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="font-serif text-2xl text-off-white font-medium">
          Reset Password
        </h1>
        <p className="text-xs text-off-white/60 mt-1">
          Enter your registered email to receive recovery instructions
        </p>
      </div>

      {success ? (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-6 rounded-sm text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <h3 className="font-serif text-lg text-emerald-200">
            Recovery Email Sent
          </h3>
          <p className="text-xs text-emerald-300 mt-2 leading-relaxed">
            If an account exists with that email address, you will receive a secure password reset link shortly.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="text-xs uppercase tracking-widest text-gold-light hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
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
            id="email"
            type="email"
            label="Account Email"
            placeholder="student@krishfashionacademy.com"
            error={errors.email?.message}
            className="bg-charcoal-darkest border-charcoal/80 text-off-white placeholder:text-off-white/30 focus:border-gold"
            {...register("email")}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
            Send Reset Link
          </Button>

          <div className="text-center pt-4">
            <Link
              href="/login"
              className="text-xs uppercase tracking-widest text-off-white/60 hover:text-gold"
            >
              Remembered password? Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
