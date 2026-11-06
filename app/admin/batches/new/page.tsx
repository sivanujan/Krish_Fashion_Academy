import { createClient } from "@/lib/supabase/server";
import BatchForm from "@/components/admin/BatchForm";
import type { Course } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function NewBatchPage() {
  let courses: Course[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });

    courses = data || [];
  } catch (err) {
    console.error("Courses fetch error for new batch:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Create New Batch
        </h1>
        <p className="text-xs text-charcoal-light mt-1">
          Set up upcoming class dates, tuition, seat capacity, and live Zoom coordinates for Scarborough or online.
        </p>
      </div>

      <BatchForm courses={courses} />
    </div>
  );
}
