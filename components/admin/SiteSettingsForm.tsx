"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validations/course";
import { updateSiteSettingsAction } from "@/lib/actions/settings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/types/database";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface SiteSettingsFormProps {
  initialSettings?: SiteSettings | null;
}

export default function SiteSettingsForm({
  initialSettings,
}: SiteSettingsFormProps) {
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      phone: initialSettings?.phone || "+1 647-501-9569",
      whatsapp_number: initialSettings?.whatsapp_number || "16475019569",
      email: initialSettings?.email || "info@krishfashionacademy.com",
      address: initialSettings?.address || "Middlefield Rd & McNicoll Ave, Scarborough, ON",
      map_embed_url: initialSettings?.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.5833215582236!2d-79.26388482346914!3d43.82298647109472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d6b63897d833%3A0x6fdf94f1c7dcf9a!2sMiddlefield%20Rd%20%26%20McNicoll%20Ave%2C%20Toronto%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sca!4v1714000000000!5m2!1sen!2sca",
      facebook_url: initialSettings?.facebook_url || "",
      instagram_url: initialSettings?.instagram_url || "https://instagram.com/krishfashionacademy",
      tiktok_url: initialSettings?.tiktok_url || "",
      youtube_url: initialSettings?.youtube_url || "",
      counter_students: initialSettings?.counter_students ?? 0,
      counter_years: initialSettings?.counter_years ?? 0,
      counter_courses: initialSettings?.counter_courses ?? 1,
    },
  });

  const onSubmit = async (data: SiteSettingsInput) => {
    setErrorMsg(null);
    setSuccessMsg(false);
    try {
      const res = await updateSiteSettingsAction(data);
      if (res.success) {
        setSuccessMsg(true);
      } else {
        setErrorMsg(res.error || "Failed to update settings");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Site settings updated live across all public pages!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary Contact Details */}
      <div className="bg-surface p-6 sm:p-8 rounded-sm border border-charcoal/15 shadow-sm space-y-4">
        <h3 className="font-serif text-xl text-charcoal-darkest border-b border-charcoal/10 pb-3">
          Contact & Floating WhatsApp Coordinates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Voice Phone Line *"
            placeholder="+1 647-501-9569"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            label="WhatsApp Number (Digits with Country Code) *"
            placeholder="16475019569"
            error={errors.whatsapp_number?.message}
            {...register("whatsapp_number")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Inquiries Email *"
            type="email"
            placeholder="info@krishfashionacademy.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Atelier Physical Address *"
            placeholder="Middlefield Rd & McNicoll Ave, Scarborough, ON"
            error={errors.address?.message}
            {...register("address")}
          />
        </div>

        <Input
          label="Google Maps Embed URL (iframe src)"
          placeholder="https://www.google.com/maps/embed?pb=..."
          error={errors.map_embed_url?.message}
          {...register("map_embed_url")}
        />
      </div>

      {/* Social Media Links */}
      <div className="bg-surface p-6 sm:p-8 rounded-sm border border-charcoal/15 shadow-sm space-y-4">
        <h3 className="font-serif text-xl text-charcoal-darkest border-b border-charcoal/10 pb-3">
          Social Media Handles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Instagram URL"
            placeholder="https://instagram.com/krishfashionacademy"
            error={errors.instagram_url?.message}
            {...register("instagram_url")}
          />

          <Input
            label="Facebook URL"
            placeholder="https://facebook.com/krishfashionacademy"
            error={errors.facebook_url?.message}
            {...register("facebook_url")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="TikTok URL"
            placeholder="https://tiktok.com/@krishfashionacademy"
            error={errors.tiktok_url?.message}
            {...register("tiktok_url")}
          />

          <Input
            label="YouTube Channel URL"
            placeholder="https://youtube.com/@krishfashionacademy"
            error={errors.youtube_url?.message}
            {...register("youtube_url")}
          />
        </div>
      </div>

      {/* Numerical Counters */}
      <div className="bg-surface p-6 sm:p-8 rounded-sm border border-charcoal/15 shadow-sm space-y-4">
        <h3 className="font-serif text-xl text-charcoal-darkest border-b border-charcoal/10 pb-3">
          Statistical Animated Counters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Graduated Students Count"
            type="number"
            placeholder="1250"
            error={errors.counter_students?.message}
            {...register("counter_students")}
          />

          <Input
            label="Years of Experience"
            type="number"
            placeholder="12"
            error={errors.counter_years?.message}
            {...register("counter_years")}
          />

          <Input
            label="Active Masterclass Modules"
            type="number"
            placeholder="15"
            error={errors.counter_courses?.message}
            {...register("counter_courses")}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" isLoading={isSubmitting} size="lg">
          Save Site Settings
        </Button>
      </div>
    </form>
  );
}
