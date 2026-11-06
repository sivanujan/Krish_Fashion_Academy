"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Lock, Mail } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    try {
      const res = await loginAction(data);
      if (res.success && res.redirectPath) {
        router.push(res.redirectPath);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Invalid email or password");
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errorMessage && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs rounded-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-xs uppercase tracking-widest text-off-white/80 font-medium mb-1.5"
        >
          Email Address
        </label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="student@krishfashionacademy.com"
            error={errors.email?.message}
            className="bg-charcoal-darkest border-charcoal/80 text-off-white placeholder:text-off-white/30 focus:border-gold"
            {...register("email")}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="password"
            className="block text-xs uppercase tracking-widest text-off-white/80 font-medium"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-[11px] uppercase tracking-wider text-gold-light/80 hover:text-gold"
          >
            Forgot?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          className="bg-charcoal-darkest border-charcoal/80 text-off-white placeholder:text-off-white/30 focus:border-gold"
          {...register("password")}
        />
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full mt-2"
        size="lg"
      >
        Sign In to Portal
      </Button>

      <div className="mt-6 pt-6 border-t border-charcoal-light/30 text-center">
        <p className="text-xs text-off-white/60">
          Enrolled student but haven&apos;t received your login?
        </p>
        <p className="text-xs text-gold-light mt-1">
          Please contact Academy Administration.
        </p>
      </div>
    </form>
  );
}
