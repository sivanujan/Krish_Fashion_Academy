"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessonSchema, type LessonInput } from "@/lib/validations/course";
import { upsertLessonAction, deleteLessonAction } from "@/lib/actions/courses";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Course, Lesson } from "@/types/database";
import { Plus, Edit2, Trash2, Calendar, Video, AlertCircle } from "lucide-react";

interface LessonsManagerProps {
  courses: Course[];
  initialLessons: Lesson[];
}

export default function LessonsManager({
  courses,
  initialLessons,
}: LessonsManagerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || ""
  );
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredLessons = initialLessons.filter(
    (l) => l.course_id === selectedCourseId
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      course_id: selectedCourseId,
      title: "",
      description: "",
      class_date: "",
      sort_order: filteredLessons.length + 1,
      video_provider: null,
      video_id: "",
      is_published: true,
    },
  });

  const openCreateModal = () => {
    setEditingLesson(null);
    reset({
      course_id: selectedCourseId,
      title: "",
      description: "",
      class_date: "",
      sort_order: filteredLessons.length + 1,
      video_provider: null,
      video_id: "",
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    reset({
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description || "",
      class_date: lesson.class_date || "",
      sort_order: lesson.sort_order,
      video_provider: lesson.video_provider,
      video_id: lesson.video_id || "",
      is_published: lesson.is_published,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: LessonInput) => {
    setErrorMsg(null);
    try {
      const res = await upsertLessonAction(editingLesson?.id || null, {
        ...data,
        course_id: selectedCourseId,
        video_provider: data.video_provider || null,
        video_id: data.video_id || null,
      });

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to save lesson");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    }
  };

  const handleDelete = async (lessonId: string, title: string) => {
    if (!confirm(`Delete lesson "${title}"?`)) return;
    await deleteLessonAction(lessonId);
  };

  return (
    <div className="space-y-6">
      {/* Course Selector Bar */}
      <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label
            htmlFor="course-select"
            className="block text-xs uppercase tracking-widest text-charcoal font-medium mb-1.5"
          >
            Select Course to Manage Lessons
          </label>
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-surface border border-charcoal/20 rounded-sm px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-gold"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={openCreateModal} className="self-end sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Lesson</span>
        </Button>
      </div>

      {/* Lessons Table */}
      <div className="bg-surface rounded-sm border border-charcoal/15 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-charcoal/10 flex items-center justify-between">
          <h3 className="font-serif text-xl text-charcoal-darkest">
            Lessons for Selected Masterclass
          </h3>
          <span className="text-xs text-charcoal-light">
            {filteredLessons.length} lessons registered
          </span>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="p-12 text-center text-charcoal-light text-sm">
            No lessons added for this course yet. Click &quot;Add Lesson&quot; to begin building the syllabus.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-charcoal font-medium uppercase tracking-wider border-b border-charcoal/10">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4">Class Date</th>
                  <th className="py-3 px-4">Video Provider & ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-gold-dark">
                      #{lesson.sort_order}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-heading text-sm">{lesson.title}</p>
                      {lesson.description && (
                        <p className="text-[11px] text-charcoal-light line-clamp-1 mt-0.5">
                          {lesson.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-light">
                      {lesson.class_date ? formatDate(lesson.class_date) : "TBD"}
                    </td>
                    <td className="py-3.5 px-4">
                      {lesson.video_id ? (
                        <div className="flex items-center space-x-1.5 text-charcoal font-mono text-[11px]">
                          <Video className="w-3.5 h-3.5 text-gold-dark" />
                          <span>{lesson.video_provider}: {lesson.video_id}</span>
                        </div>
                      ) : (
                        <span className="text-charcoal-light italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={lesson.is_published ? "success" : "neutral"}>
                        {lesson.is_published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(lesson)}
                          title="Edit Lesson"
                          className="p-1.5 text-charcoal-light hover:text-charcoal-darkest"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(lesson.id, lesson.title)}
                          title="Delete Lesson"
                          className="p-1.5 text-rose-500 hover:text-rose-700"
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

      {/* Modal dialog for creating / editing lesson */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-darkest/75 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-xl rounded-sm border border-charcoal/20 p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in">
            <h3 className="font-serif text-2xl text-charcoal-darkest">
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Lesson Title *"
                placeholder="e.g. Lesson 1: Precision Measurements & Apex Lines"
                error={errors.title?.message}
                {...register("title")}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Class Date"
                  type="date"
                  error={errors.class_date?.message}
                  {...register("class_date")}
                />

                <Input
                  label="Sort Order"
                  type="number"
                  error={errors.sort_order?.message}
                  {...register("sort_order")}
                />
              </div>

              <Textarea
                label="Description & Notes"
                rows={3}
                placeholder="Overview of tools, exercises, and homework..."
                error={errors.description?.message}
                {...register("description")}
              />

              {/* Video provider inputs (plain text inputs per Phase 1 spec) */}
              <div className="p-4 bg-subtle rounded-sm border border-charcoal/10 space-y-3">
                <span className="block text-xs uppercase tracking-widest text-charcoal font-medium">
                  Video Recording Configuration (Phase 2 Preview)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-charcoal-light mb-1">
                      Provider (youtube / bunny)
                    </label>
                    <select
                      className="w-full bg-surface border border-charcoal/20 rounded-sm px-3 py-2 text-xs text-heading focus:outline-none focus:border-gold"
                      {...register("video_provider")}
                    >
                      <option value="">None (In-Person Only)</option>
                      <option value="youtube">YouTube Unlisted</option>
                      <option value="bunny">Bunny Stream</option>
                    </select>
                  </div>
                  <Input
                    label="Video ID / Hash"
                    placeholder="e.g. dQw4w9WgXcQ"
                    error={errors.video_id?.message}
                    {...register("video_id")}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="lesson_is_published"
                  className="w-4 h-4 rounded border-charcoal/30 text-gold focus:ring-gold"
                  {...register("is_published")}
                />
                <label
                  htmlFor="lesson_is_published"
                  className="text-xs uppercase tracking-wider text-charcoal font-medium select-none"
                >
                  Published (Visible to actively enrolled students)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={isSubmitting}>
                  Save Lesson
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
