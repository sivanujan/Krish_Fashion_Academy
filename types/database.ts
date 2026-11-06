export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AttendanceMode = 'in_person' | 'online';
export type SessionMode = 'in_person' | 'online' | 'both';
export type PaymentStatus = 'unpaid' | 'paid' | 'waived' | 'refunded';
export type SessionStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type EnquiryStatus = 'new' | 'contacted' | 'registered' | 'closed';
export type FeedbackStatus = 'pending' | 'approved' | 'hidden';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: 'admin' | 'student';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: 'admin' | 'student';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: 'admin' | 'student';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          short_description: string;
          description: string;
          duration: string;
          fee_cad: number;
          cover_image_url: string | null;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          short_description: string;
          description: string;
          duration: string;
          fee_cad?: number;
          cover_image_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          short_description?: string;
          description?: string;
          duration?: string;
          fee_cad?: number;
          cover_image_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      class_sessions: {
        Row: {
          id: string;
          course_id: string;
          batch_code: string;
          title: string;
          start_date: string;
          second_date: string | null;
          class_dates: string[];
          start_time: string;
          end_time: string;
          location: string;
          mode: SessionMode;
          price_cad: number | null;
          discount_percent: number | null;
          discount_label: string | null;
          seats_total: number;
          seats_left: number;
          online_join_url: string | null;
          feedback_token: string;
          feedback_open: boolean;
          status: SessionStatus;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          batch_code: string;
          title: string;
          start_date: string;
          second_date?: string | null;
          class_dates?: string[];
          start_time?: string;
          end_time?: string;
          location?: string;
          mode?: SessionMode;
          price_cad?: number | null;
          discount_percent?: number | null;
          discount_label?: string | null;
          seats_total?: number;
          seats_left?: number;
          online_join_url?: string | null;
          feedback_token?: string;
          feedback_open?: boolean;
          status?: SessionStatus;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          batch_code?: string;
          title?: string;
          start_date?: string;
          second_date?: string | null;
          class_dates?: string[];
          start_time?: string;
          end_time?: string;
          location?: string;
          mode?: SessionMode;
          price_cad?: number | null;
          discount_percent?: number | null;
          discount_label?: string | null;
          seats_total?: number;
          seats_left?: number;
          online_join_url?: string | null;
          feedback_token?: string;
          feedback_open?: boolean;
          status?: SessionStatus;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_sessions_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          session_id: string | null;
          title: string;
          description: string | null;
          class_date: string | null;
          sort_order: number;
          video_provider: 'youtube' | 'bunny' | null;
          video_id: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          session_id?: string | null;
          title: string;
          description?: string | null;
          class_date?: string | null;
          sort_order?: number;
          video_provider?: 'youtube' | 'bunny' | null;
          video_id?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          session_id?: string | null;
          title?: string;
          description?: string | null;
          class_date?: string | null;
          sort_order?: number;
          video_provider?: 'youtube' | 'bunny' | null;
          video_id?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "class_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          session_id: string | null;
          attendance_mode: AttendanceMode;
          payment_status: PaymentStatus;
          amount_paid_cad: number | null;
          payment_note: string | null;
          status: 'active' | 'expired';
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          session_id?: string | null;
          attendance_mode?: AttendanceMode;
          payment_status?: PaymentStatus;
          amount_paid_cad?: number | null;
          payment_note?: string | null;
          status?: 'active' | 'expired';
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          session_id?: string | null;
          attendance_mode?: AttendanceMode;
          payment_status?: PaymentStatus;
          amount_paid_cad?: number | null;
          payment_note?: string | null;
          status?: 'active' | 'expired';
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "class_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      feedback: {
        Row: {
          id: string;
          session_id: string;
          student_id: string | null;
          name: string;
          phone: string | null;
          rating_overall: number;
          rating_teaching: number;
          rating_content: number;
          liked: string;
          improve: string | null;
          would_recommend: boolean;
          consent_to_publish: boolean;
          status: FeedbackStatus;
          admin_reply: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id?: string | null;
          name: string;
          phone?: string | null;
          rating_overall: number;
          rating_teaching: number;
          rating_content: number;
          liked: string;
          improve?: string | null;
          would_recommend?: boolean;
          consent_to_publish?: boolean;
          status?: FeedbackStatus;
          admin_reply?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          student_id?: string | null;
          name?: string;
          phone?: string | null;
          rating_overall?: number;
          rating_teaching?: number;
          rating_content?: number;
          liked?: string;
          improve?: string | null;
          would_recommend?: boolean;
          consent_to_publish?: boolean;
          status?: FeedbackStatus;
          admin_reply?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "class_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      gallery_items: {
        Row: {
          id: string;
          image_url: string | null;
          caption: string | null;
          category: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          caption?: string | null;
          category: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          caption?: string | null;
          category?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string;
          message: string;
          rating: number;
          photo_url: string | null;
          is_published: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          message: string;
          rating?: number;
          photo_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          message?: string;
          rating?: number;
          photo_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          course_interest: string | null;
          message: string;
          status: EnquiryStatus;
          admin_note: string | null;
          preferred_mode: AttendanceMode | null;
          interested_session_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          course_interest?: string | null;
          message: string;
          status?: EnquiryStatus;
          admin_note?: string | null;
          preferred_mode?: AttendanceMode | null;
          interested_session_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          course_interest?: string | null;
          message?: string;
          status?: EnquiryStatus;
          admin_note?: string | null;
          preferred_mode?: AttendanceMode | null;
          interested_session_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          is_published: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          phone: string;
          whatsapp_number: string;
          email: string;
          address: string;
          map_embed_url: string | null;
          facebook_url: string | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          youtube_url: string | null;
          counter_students: number;
          counter_years: number;
          counter_courses: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone?: string;
          whatsapp_number?: string;
          email?: string;
          address?: string;
          map_embed_url?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          youtube_url?: string | null;
          counter_students?: number;
          counter_years?: number;
          counter_courses?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          whatsapp_number?: string;
          email?: string;
          address?: string;
          map_embed_url?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          youtube_url?: string | null;
          counter_students?: number;
          counter_years?: number;
          counter_courses?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_sessions: {
        Row: {
          id: string;
          course_id: string;
          batch_code: string;
          title: string;
          start_date: string;
          second_date: string | null;
          class_dates: string[];
          start_time: string;
          end_time: string;
          location: string;
          mode: SessionMode;
          price_cad: number | null;
          discount_percent: number | null;
          discount_label: string | null;
          seats_total: number;
          seats_left: number;
          status: SessionStatus;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          course_title: string | null;
          course_slug: string | null;
        };
      };
      public_testimonials: {
        Row: {
          id: string;
          student_name: string;
          rating_overall: number;
          message: string;
          batch_title: string;
          created_at: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type ClassSession = Database['public']['Tables']['class_sessions']['Row'];
export type PublicSession = Database['public']['Views']['public_sessions']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Enrollment = Database['public']['Tables']['enrollments']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type PublicTestimonial = Database['public']['Views']['public_testimonials']['Row'];
export type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];
export type Enquiry = Database['public']['Tables']['enquiries']['Row'];
export type FAQ = Database['public']['Tables']['faqs']['Row'];
export type Faq = FAQ;
export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
