"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Lesson } from "@/lib/lessons";

export function LessonCard({
  lesson,
  index,
}: {
  lesson: Lesson;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Link
        href={`/e-learning/${lesson.slug}`}
        className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{lesson.categoryIcon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-navy">{lesson.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {lesson.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">
                {lesson.lessonsCount} leçons
              </span>
              <ArrowRight size={14} className="text-amber" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
