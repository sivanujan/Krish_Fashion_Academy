import Link from "next/link";
import Image from "next/image";
import RevealText from "@/components/animations/RevealText";
import { Card } from "@/components/ui/Card";
import { formatCAD } from "@/lib/utils";
import type { Course } from "@/types/database";
import { Clock, ArrowRight, Sparkles } from "lucide-react";

interface FeaturedCoursesProps {
  courses: Course[];
}

export default function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-charcoal-darker text-off-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-charcoal-light/40 pb-8">
          <div>
            <div className="inline-flex items-center space-x-2 text-gold-light mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.25em] font-medium">
                Curriculum & Disciplines
              </span>
            </div>
            <RevealText
              tag="h2"
              className="font-serif text-3xl sm:text-5xl font-light text-off-white tracking-tight"
            >
              Featured Masterclasses
            </RevealText>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              href="/courses"
              className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-gold-light hover:text-gold transition-colors group"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="bg-charcoal-darkest border-charcoal/50 flex flex-col h-full group"
            >
              {/* Cover Image with Zoom Effect */}
              <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-darker">
                {course.cover_image_url ? (
                  <Image
                    src={course.cover_image_url}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold/30">
                    KFA Atelier
                  </div>
                )}
                {/* Duration Badge */}
                <div className="absolute top-4 left-4 bg-charcoal-darkest/90 backdrop-blur-sm border border-gold/40 text-gold-light text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm flex items-center space-x-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-off-white group-hover:text-gold-light transition-colors leading-snug">
                    <Link href={`/courses/${course.slug}`}>
                      {course.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-off-white/70 font-light line-clamp-3 leading-relaxed">
                    {course.short_description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-charcoal/60 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-off-white/50">
                      Tuition Fee
                    </span>
                    <span className="font-serif text-lg sm:text-xl text-gold-light font-medium">
                      {formatCAD(course.fee_cad)}
                    </span>
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="inline-flex items-center space-x-1 text-xs uppercase tracking-widest text-off-white hover:text-gold font-medium transition-colors"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
