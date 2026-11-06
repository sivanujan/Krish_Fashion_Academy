"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, type CourseInput } from "@/lib/validations/course";
import { upsertCourseAction } from "@/lib/actions/courses";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { Course } from "@/types/database";
import { AlertCircle } from "lucide-react";

interface CourseFormProps {
  initialCourse?: Course | null;
}

export default function CourseForm({ initialCourse }: CourseFormProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>(
    initialCourse?.cover_image_url || ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialCourse?.title || "",
      slug: initialCourse?.slug || "",
      short_description: initialCourse?.short_description || "",
      description: initialCourse?.description || "",
      duration: initialCourse?.duration || "",
      fee_cad: initialCourse?.fee_cad || 0,
      cover_image_url: initialCourse?.cover_image_url || "",
      is_published: initialCourse?.is_published ?? true,
      sort_order: initialCourse?.sort_order || 0,
    },
  });

  const onSubmit = async (data: CourseInput) => {
    setErrorMsg(null);
    try {
      const res = await upsertCourseAction(initialCourse?.id || null, {
        ...data,
        cover_image_url: coverUrl,
      });

      if (res.success) {
        router.push("/admin/courses");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to save course");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving the course");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Course Title *"
          id="title"
          placeholder="e.g. Professional Bridal Blouse Designing"
          error={errors.title?.message}
          {...register("title")}
          onChange={(e) => {
            register("title").onChange(e);
            if (!initialCourse) {
              // Auto generate slug for new courses
              const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
              setValue("slug", slug, { shouldValidate: true });
            }
          }}
        />

        <Input
          label="URL Slug *"
          id="slug"
          placeholder="bridal-blouse-designing"
          error={errors.slug?.message}
          {...register("slug")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Duration *"
          id="duration"
          placeholder="e.g. 8 Weeks (Weekend Intensive)"
          error={errors.duration?.message}
          {...register("duration")}
        />

        <Input
          label="Course Fee (CAD $) *"
          id="fee_cad"
          type="number"
          step="10"
          placeholder="350"
          error={errors.fee_cad?.message}
          {...register("fee_cad")}
        />
      </div>

      <Textarea
        label="Short Summary (Card Preview) *"
        id="short_description"
        rows={2}
        placeholder="Brief highlight that appears on homepage course cards..."
        error={errors.short_description?.message}
        {...register("short_description")}
      />

      <Textarea
        label="Full Course Syllabus & Description *"
        id="description"
        rows={6}
        placeholder="Comprehensive details on topics, pattern drafting, machines, and what students will create..."
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="pt-2">
        <ImageUpload
          label="Cover Image (Supabase Storage)"
          value={coverUrl}
          onChange={(url) => setCoverUrl(url)}
          onRemove={() => setCoverUrl("")}
          folder="courses"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Input
          label="Display Sort Order"
          id="sort_order"
          type="number"
          placeholder="0"
          error={errors.sort_order?.message}
          {...register("sort_order")}
        />

        <div className="flex items-center space-x-3 pt-6">
          <input
            type="checkbox"
            id="is_published"
            className="w-4 h-4 rounded border-charcoal/30 text-gold focus:ring-gold"
            {...register("is_published")}
          />
          <label
            htmlFor="is_published"
            className="text-xs uppercase tracking-wider text-charcoal font-medium select-none"
          >
            Publish Live on Website
          </label>
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-6 border-t border-charcoal/10">
        <Button type="submit" isLoading={isSubmitting} size="lg">
          {initialCourse ? "Save Changes" : "Create Masterclass"}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs uppercase tracking-widest text-charcoal-light hover:text-charcoal font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
