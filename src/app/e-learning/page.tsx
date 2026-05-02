"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { lessons, categories } from "@/lib/lessons";
import { LessonCard } from "@/components/LessonCard";

export default function ELearningPage() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-navy px-5 pt-14 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <h1 className="text-lg font-bold text-white">Apprendre la LST</h1>
        </div>

        {/* Word of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-teal rounded-2xl p-4 mt-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <BookOpen size={12} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
              Mot du jour
            </span>
          </div>
          <p className="text-white font-bold text-base">
            Comment dire &quot;Bonjour&quot; en LST
          </p>
          <p className="text-white/70 text-xs mt-1">
            👋 Levez la main ouverte et inclinez-la vers l&apos;avant
          </p>
        </motion.div>
      </div>

      {/* Quiz Banner */}
      <div className="px-5 -mt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-navy-light rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-amber-light font-bold uppercase tracking-wider">
                Prêt pour un défi ?
              </p>
              <p className="text-white text-sm font-bold mt-0.5">
                Mode Entraînement Quiz
              </p>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
        </motion.div>
      </div>

      {/* Module List */}
      <div className="px-5 mt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-navy uppercase tracking-wider">
            Modules d&apos;apprentissage
          </h2>
          <span className="text-[10px] text-amber font-bold uppercase tracking-wider">
            Tout voir
          </span>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson, i) => (
            <LessonCard key={lesson.slug} lesson={lesson} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
