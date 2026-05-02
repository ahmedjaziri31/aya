"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getLessonBySlug } from "@/lib/lessons";

export default function LessonDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const lesson = getLessonBySlug(slug);
  const [currentStep, setCurrentStep] = useState(0);

  if (!lesson) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted text-sm">Leçon introuvable</p>
          <Link href="/e-learning" className="text-amber text-sm font-bold mt-2 inline-block">
            Retour
          </Link>
        </div>
      </div>
    );
  }

  const step = lesson.steps[currentStep];
  const progress = ((currentStep + 1) / lesson.steps.length) * 100;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/e-learning"
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-navy" />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-navy">{lesson.title}</h1>
            <p className="text-[10px] text-muted">
              Étape {currentStep + 1} / {lesson.steps.length}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-5 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Sign emoji display */}
            <div className="bg-navy rounded-3xl p-8 flex items-center justify-center mb-6">
              <span className="text-8xl">{step.signEmoji}</span>
            </div>

            {/* Step title */}
            <h2 className="text-xl font-black text-navy">{step.title}</h2>

            {/* Description */}
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {step.description}
            </p>

            {/* Tip */}
            {step.tip && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 bg-amber-pale border border-amber-light/30 rounded-2xl p-4 flex gap-3"
              >
                <Lightbulb size={16} className="text-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-amber uppercase tracking-wider mb-1">
                    Conseil Culturel
                  </p>
                  <p className="text-xs text-navy leading-relaxed">
                    {step.tip}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-5 pb-6 pt-4 flex gap-3">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="h-12 px-6 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-navy disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all"
        >
          Précédent
        </button>
        <button
          onClick={() =>
            setCurrentStep((s) => Math.min(lesson.steps.length - 1, s + 1))
          }
          disabled={currentStep === lesson.steps.length - 1}
          className="flex-1 h-12 rounded-2xl bg-navy text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all"
        >
          Suivant
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
