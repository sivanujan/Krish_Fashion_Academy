import { z } from "zod";

export const recordingSchema = z.object({
  id: z.string().uuid("Invalid recording ID").optional().or(z.literal("")),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().or(z.literal("")),
  course_id: z.string().uuid("Invalid course").optional().or(z.literal("")),
  session_id: z.string().uuid("Invalid batch").optional().or(z.literal("")),
  class_date: z.string().optional().or(z.literal("")),
  video_url: z.string().min(1, "Video URL or iframe embed code is required"),
  duration_minutes: z.coerce.number().min(0, "Duration must be positive").optional().nullable(),
  is_published: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
  student_ids: z.array(z.string().uuid()).default([]),
  expires_at: z.string().optional().nullable().or(z.literal("")),
});

export type RecordingFormData = z.infer<typeof recordingSchema>;

export const updateAccessSchema = z.object({
  recording_id: z.string().uuid(),
  student_ids: z.array(z.string().uuid()),
  expires_at: z.string().optional().nullable().or(z.literal("")),
});

export type UpdateAccessInput = z.infer<typeof updateAccessSchema>;

