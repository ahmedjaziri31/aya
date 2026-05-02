"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface TranslationResult {
  sign: string;
  description: string;
  source: "local" | "ai";
}

export function SignOverlay({
  translation,
  handDetected,
}: {
  translation: TranslationResult | null;
  handDetected: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {translation ? (
        <motion.div
          key={translation.sign}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold text-success uppercase tracking-wider">
                Traduction Live (LS)
              </span>
            </div>
            {translation.source === "ai" && (
              <span className="text-[8px] font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy">
                IA
              </span>
            )}
          </div>
          <p className="text-lg font-black text-navy leading-snug">
            &quot;{translation.sign}&quot;
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            {translation.description}
          </p>
        </motion.div>
      ) : handDetected ? (
        <motion.div
          key="hand-detected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-black/40 backdrop-blur-sm rounded-2xl p-3 text-center"
        >
          <p className="text-xs text-white/80">
            Main détectée — maintenez le geste...
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="waiting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-black/30 backdrop-blur-sm rounded-2xl p-3 text-center"
        >
          <p className="text-xs text-white/60">
            Montrez un signe devant la caméra...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
