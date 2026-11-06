"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "uploads",
  label = "Cover Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setUploading(true);

      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("public-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("public-images").getPublicUrl(data.path);

      onChange(publicUrl);
    } catch (err: unknown) {
      console.error("Storage upload error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to upload image to Supabase Storage");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs uppercase tracking-widest text-charcoal font-medium">
          {label}
        </label>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {value ? (
        <div className="relative aspect-[16/9] w-full max-w-md rounded-sm overflow-hidden border border-charcoal/20 bg-charcoal/5">
          <Image src={value} alt="Uploaded preview" fill className="object-cover" />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-charcoal/20 rounded-sm p-6 hover:border-gold/60 cursor-pointer bg-surface transition-colors max-w-md">
          {uploading ? (
            <div className="flex flex-col items-center space-y-2 text-charcoal">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
              <span className="text-xs uppercase tracking-wider">
                Uploading to Supabase Storage...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-charcoal">
              <Upload className="w-8 h-8 text-gold" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Click to upload image
              </span>
              <span className="text-[10px] text-charcoal-light">
                PNG, JPG, WebP up to 5MB
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
