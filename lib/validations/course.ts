import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  short_description: z.string().min(10, "Short description must be at least 10 characters"),
  description: z.string().min(20, "Full description must be at least 20 characters"),
  duration: z.string().min(2, "Duration is required"),
  fee_cad: z.coerce.number().min(0, "Fee must be greater than or equal to 0"),
  cover_image_url: z.string().optional().or(z.literal("")),
  is_published: z.boolean().default(false),
  sort_order: z.coerce.number().default(0),
});

export const sessionSchema = z.object({
  course_id: z.string().uuid("Select a valid course"),
  batch_code: z.string().min(3, "Batch code is required (e.g. SBM-2026-05)"),
  title: z.string().min(3, "Batch title must be at least 3 characters"),
  start_date: z.string().min(10, "Start date is required"),
  second_date: z.string().optional().or(z.literal("")),
  class_dates: z.array(z.string()).default([]),
  start_time: z.string().default("11:00:00"),
  end_time: z.string().default("16:00:00"),
  location: z.string().default("Middlefield Rd & McNicoll Ave, Scarborough, ON"),
  mode: z.enum(["in_person", "online", "both"]).default("both"),
  price_cad: z.coerce.number().min(0).nullable().optional(),
  discount_percent: z.coerce.number().min(0).max(100).nullable().optional(),
  discount_label: z.string().optional().or(z.literal("")),
  seats_total: z.coerce.number().min(1).default(12),
  seats_left: z.coerce.number().min(0).default(12),
  online_join_url: z.string().optional().or(z.literal("")),
  feedback_open: z.boolean().default(false),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).default("upcoming"),
  is_published: z.boolean().default(true),
});

export const lessonSchema = z.object({
  course_id: z.string().uuid("Invalid course ID"),
  session_id: z.string().uuid("Invalid session ID").nullable().optional().or(z.literal("")),
  title: z.string().min(3, "Lesson title must be at least 3 characters"),
  description: z.string().optional().or(z.literal("")),
  class_date: z.string().optional().or(z.literal("")),
  sort_order: z.coerce.number().default(0),
  video_provider: z.enum(["youtube", "bunny"]).nullable().optional(),
  video_id: z.string().nullable().optional(),
  is_published: z.boolean().default(false),
});

export const studentSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Temporary password must be at least 6 characters"),
});

export const enrollmentSchema = z.object({
  student_id: z.string().uuid("Select a valid student"),
  course_id: z.string().uuid("Select a valid course"),
  session_id: z.string().uuid("Select a valid batch").nullable().optional().or(z.literal("")),
  attendance_mode: z.enum(["in_person", "online"]).default("in_person"),
  payment_status: z.enum(["unpaid", "paid", "waived", "refunded"]).default("unpaid"),
  amount_paid_cad: z.coerce.number().min(0).nullable().optional(),
  payment_note: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "expired"]).default("active"),
  expires_at: z.string().nullable().optional(),
});

export const feedbackSchema = z.object({
  session_id: z.string().uuid("Invalid session ID"),
  student_id: z.string().uuid().nullable().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().or(z.literal("")),
  rating_overall: z.coerce.number().min(1).max(5),
  rating_teaching: z.coerce.number().min(1).max(5),
  rating_content: z.coerce.number().min(1).max(5),
  liked: z.string().min(10, "Please share what you liked about the class"),
  improve: z.string().optional().or(z.literal("")),
  would_recommend: z.boolean().default(true),
  consent_to_publish: z.boolean().default(false),
});

export const publicFeedbackSchema = z.object({
  token: z.string().min(10, "Invalid feedback token"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(7, "Phone number is required for verification"),
  rating_overall: z.coerce.number().min(1).max(5),
  rating_teaching: z.coerce.number().min(1).max(5),
  rating_content: z.coerce.number().min(1).max(5),
  liked: z.string().min(10, "Please share what you liked about the class"),
  improve: z.string().optional().or(z.literal("")),
  would_recommend: z.boolean().default(true),
  consent_to_publish: z.boolean().default(false),
  website_honeypot: z.string().max(0, "Spam detected").optional(),
});

export const siteSettingsSchema = z.object({
  phone: z.string().min(5, "Phone is required"),
  whatsapp_number: z.string().min(5, "WhatsApp is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(5, "Address is required"),
  map_embed_url: z.string().optional().or(z.literal("")),
  facebook_url: z.string().optional().or(z.literal("")),
  instagram_url: z.string().optional().or(z.literal("")),
  tiktok_url: z.string().optional().or(z.literal("")),
  youtube_url: z.string().optional().or(z.literal("")),
  counter_students: z.coerce.number().min(0),
  counter_years: z.coerce.number().min(0),
  counter_courses: z.coerce.number().min(0),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type PublicFeedbackInput = z.infer<typeof publicFeedbackSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
