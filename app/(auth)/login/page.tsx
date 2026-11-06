import { Metadata } from "next";
import LoginForm from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Portal Sign In",
  description: "Sign in to access your course syllabus, schedule, and student materials at Krish Fashion Academy.",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="font-serif text-2xl text-off-white font-medium">
          Sign In
        </h1>
        <p className="text-xs text-off-white/60 mt-1">
          Access your courses & academy announcements
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
