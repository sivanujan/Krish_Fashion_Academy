"use server";

import { createClient } from "@/lib/supabase/server";
import { recordingSchema, updateAccessSchema } from "@/lib/validations/recording";
import { parseVideoSource } from "@/lib/video/parseVideoSource";
import { revalidatePath } from "next/cache";

/**
 * Server-side authorization check to ensure the caller has active admin privileges.
 */
async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Please sign in as an administrator.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.is_active) {
    throw new Error("Forbidden: Administrator privileges required.");
  }

  return { user, supabase };
}

/**
 * Saves or updates a class recording and synchronizes student access permissions atomically.
 */
export async function saveRecordingAction(rawFormData: unknown) {
  try {
    const { user, supabase } = await ensureAdmin();
    const data = recordingSchema.parse(rawFormData);

    // 1. Rigorous server-side video URL / embed parser
    const parsed = parseVideoSource(data.video_url);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }

    const expiresAt = data.expires_at ? new Date(data.expires_at).toISOString() : null;
    const recordingPayload = {
      id: data.id || undefined,
      title: data.title,
      description: data.description || null,
      course_id: data.course_id || null,
      session_id: data.session_id || null,
      class_date: data.class_date || null,
      source_type: parsed.source_type,
      source_url: data.video_url, // Original input preserved for admin reference
      embed_src: parsed.embed_src,
      video_id: parsed.video_id,
      thumbnail_url: parsed.thumbnail_url,
      duration_minutes: data.duration_minutes || null,
      is_published: data.is_published,
      sort_order: data.sort_order,
    };

    let recordingId = data.id || null;

    // 2. Attempt atomic execution via Supabase RPC
    const { data: rpcId, error: rpcError } = await supabase.rpc("save_recording_with_access", {
      p_recording: recordingPayload,
      p_student_ids: data.student_ids,
      p_expires_at: expiresAt,
    });

    if (!rpcError && rpcId) {
      recordingId = rpcId;
    } else {
      // Direct table upsert fallback if the RPC has not been executed yet in the SQL editor
      if (recordingId) {
        const { error: updateErr } = await supabase
          .from("recordings")
          .update({
            ...recordingPayload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", recordingId);

        if (updateErr) {
          return { success: false, error: updateErr.message };
        }
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from("recordings")
          .insert({
            ...recordingPayload,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (insertErr || !inserted) {
          return { success: false, error: insertErr?.message || "Failed to create recording record" };
        }
        recordingId = inserted.id;
      }

      // Sync access table
      if (recordingId) {
        // Delete removed students
        await supabase
          .from("recording_access")
          .delete()
          .eq("recording_id", recordingId)
          .not("student_id", "in", `(${data.student_ids.join(",") || "00000000-0000-0000-0000-000000000000"})`);

        // Upsert selected students
        if (data.student_ids.length > 0) {
          const accessRows = data.student_ids.map((studentId) => ({
            recording_id: recordingId as string,
            student_id: studentId,
            granted_by: user.id,
            granted_at: new Date().toISOString(),
            expires_at: expiresAt,
          }));

          const { error: accessErr } = await supabase
            .from("recording_access")
            .upsert(accessRows, { onConflict: "recording_id,student_id" });

          if (accessErr) {
            console.error("Warning: Could not sync some student access records:", accessErr.message);
          }
        }
      }
    }

    revalidatePath("/admin/recordings");
    revalidatePath("/admin/lessons");
    revalidatePath("/admin/students");
    revalidatePath("/dashboard/recordings");
    revalidatePath("/dashboard");

    return { success: true, id: recordingId };
  } catch (err: unknown) {
    console.error("saveRecordingAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while saving recording.",
    };
  }
}

/**
 * Permanently deletes a class recording and its associated student access records.
 */
export async function deleteRecordingAction(recordingId: string) {
  try {
    const { supabase } = await ensureAdmin();

    const { error } = await supabase.from("recordings").delete().eq("id", recordingId);
    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/recordings");
    revalidatePath("/dashboard/recordings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete recording.",
    };
  }
}

/**
 * Quickly toggles the publication status of a class recording.
 */
export async function toggleRecordingPublishAction(recordingId: string, currentStatus: boolean) {
  try {
    const { supabase } = await ensureAdmin();

    const { error } = await supabase
      .from("recordings")
      .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", recordingId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/recordings");
    revalidatePath("/dashboard/recordings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update publication status.",
    };
  }
}

/**
 * Updates student access permissions and expiration for an existing recording.
 */
export async function updateRecordingAccessAction(rawInput: unknown) {
  try {
    const { user, supabase } = await ensureAdmin();
    const data = updateAccessSchema.parse(rawInput);
    const expiresAt = data.expires_at ? new Date(data.expires_at).toISOString() : null;

    // Delete removed students
    await supabase
      .from("recording_access")
      .delete()
      .eq("recording_id", data.recording_id)
      .not("student_id", "in", `(${data.student_ids.join(",") || "00000000-0000-0000-0000-000000000000"})`);

    if (data.student_ids.length > 0) {
      const accessRows = data.student_ids.map((studentId) => ({
        recording_id: data.recording_id,
        student_id: studentId,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
        expires_at: expiresAt,
      }));

      const { error } = await supabase
        .from("recording_access")
        .upsert(accessRows, { onConflict: "recording_id,student_id" });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/admin/recordings");
    revalidatePath("/dashboard/recordings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update recording access.",
    };
  }
}

/**
 * Student action: Records playback watch position and completion status.
 */
export async function saveRecordingProgressAction(
  recordingId: string,
  positionSeconds: number,
  completed: boolean = false
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Verify active profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (!profile?.is_active) {
      return { success: false, error: "Student account inactive" };
    }

    // Upsert into recording_views
    const { error } = await supabase.from("recording_views").upsert(
      {
        recording_id: recordingId,
        student_id: user.id,
        last_position_seconds: Math.max(0, Math.floor(positionSeconds)),
        completed: Boolean(completed),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "recording_id,student_id" }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save playback progress.",
    };
  }
}

/**
 * Grants or revokes access to a single recording for a specific student.
 */
export async function toggleStudentRecordingAccessAction(
  studentId: string,
  recordingId: string,
  grant: boolean,
  expiresAt?: string | null
) {
  try {
    const { user, supabase } = await ensureAdmin();

    if (grant) {
      const { error } = await supabase.from("recording_access").upsert(
        {
          recording_id: recordingId,
          student_id: studentId,
          granted_by: user.id,
          granted_at: new Date().toISOString(),
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        },
        { onConflict: "recording_id,student_id" }
      );
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("recording_access")
        .delete()
        .eq("recording_id", recordingId)
        .eq("student_id", studentId);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/recordings");
    revalidatePath("/dashboard/recordings");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle student recording access.",
    };
  }
}

