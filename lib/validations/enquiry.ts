import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  course_interest: z.string().optional().or(z.literal("")),
  preferred_mode: z.enum(["in_person", "online"]).optional(),
  interested_session_id: z.string().uuid().optional().or(z.literal("")),
  message: z.string().min(5, "Message must be at least 5 characters"),
  // Honeypot field (must remain empty for real humans)
  bot_trap: z.string().max(0, "Spam detected").optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
