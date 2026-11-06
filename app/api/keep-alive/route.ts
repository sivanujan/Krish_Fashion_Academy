import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Verify CRON_SECRET if configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const { searchParams } = new URL(request.url);
      const key = searchParams.get("key");
      if (key !== cronSecret) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid CRON_SECRET" },
          { status: 401 }
        );
      }
    }

    const supabase = await createClient();

    // Run a tiny select query to keep the free Supabase PostgreSQL instance active
    const { count, error } = await supabase
      .from("site_settings")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Keep-alive ping failed:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive ping successful",
      records: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Keep-alive exception:", err);
    return NextResponse.json(
      { success: false, error: "Keep-alive execution failed" },
      { status: 500 }
    );
  }
}
