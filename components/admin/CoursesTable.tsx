"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { deleteCourseAction } from "@/lib/actions/courses";
import { Badge } from "@/components/ui/Badge";
import { formatCAD } from "@/lib/utils";
import type { Course } from "@/types/database";
import { Edit2, Trash2, Clock, Plus, ExternalLink } from "lucide-react";

interface CoursesTableProps {
  courses: Course[];
}

export default function CoursesTable({ courses }: CoursesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all associated lessons.`)) {
      return;
    }

    setDeletingId(courseId);
    try {
      await deleteCourseAction(courseId);
    } catch {
      alert("Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-surface rounded-sm border border-charcoal/15 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-darkest">
            Course Catalog
          </h2>
          <p className="text-xs text-charcoal-light mt-0.5">
            Manage tuition fees, duration, descriptions, and syllabus publication status.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center space-x-2 bg-gold text-charcoal-darkest px-4 py-2.5 rounded-sm uppercase tracking-wider text-xs font-semibold hover:bg-gold-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="p-12 text-center text-charcoal-light text-sm">
          No courses created yet. Click &quot;New Course&quot; to add your first masterclass.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-subtle text-charcoal font-medium uppercase tracking-wider border-b border-charcoal/10">
              <tr>
                <th className="py-3 px-4">Cover</th>
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Fee (CAD)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-subtle/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="relative w-16 h-10 rounded-sm overflow-hidden bg-charcoal/10">
                      {course.cover_image_url ? (
                        <Image
                          src={course.cover_image_url}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-charcoal/40">
                          No cover
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-heading text-sm">{course.title}</p>
                    <span className="text-[11px] text-charcoal-light font-mono">
                      /{course.slug}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-charcoal-light">
                    {course.duration}
                  </td>
                  <td className="py-3 px-4 font-medium text-gold-dark text-sm">
                    {formatCAD(course.fee_cad)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={course.is_published ? "success" : "neutral"}>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-charcoal-light font-mono">
                    {course.sort_order}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        title="View Live"
                        className="p-1.5 text-charcoal-light hover:text-gold transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/courses/${course.id}`}
                        title="Edit Course"
                        className="p-1.5 text-charcoal-light hover:text-charcoal-darkest transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(course.id, course.title)}
                        disabled={deletingId === course.id}
                        title="Delete Course"
                        className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
