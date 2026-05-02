"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Shield } from "lucide-react";
import { usePathname } from "next/navigation";

export function LockMode() {
  const [isLocked, setIsLocked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pathname = usePathname();

  const hidden = pathname === "/" || pathname === "/video-call" || pathname === "/doctor";

  useEffect(() => {
    if (!isLocked) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common exit shortcuts
      if (
        (e.key === "w" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "q" && (e.metaKey || e.ctrlKey)) ||
        e.key === "F5" ||
        (e.key === "r" && (e.metaKey || e.ctrlKey))
      ) {
        e.preventDefault();
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);

    // Request fullscreen on mobile PWA
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isLocked]);

  const toggleLock = () => {
    if (isLocked) {
      setShowConfirm(true);
    } else {
      setIsLocked(true);
    }
  };

  const confirmUnlock = () => {
    setIsLocked(false);
    setShowConfirm(false);
  };

  if (hidden) return null;

  return (
    <>
      <button
        onClick={toggleLock}
        className={`fixed top-14 right-5 z-50 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
          isLocked
            ? "bg-amber text-navy"
            : "bg-white border border-gray-200 text-muted"
        }`}
        aria-label={isLocked ? "Déverrouiller" : "Verrouiller"}
      >
        {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
      </button>

      {/* Lock banner */}
      <AnimatePresence>
        {isLocked && !showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-5 z-50 bg-navy text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg"
          >
            <Shield size={10} />
            Mode kiosque actif
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-pale flex items-center justify-center">
                  <Lock size={18} className="text-amber" />
                </div>
                <h3 className="text-sm font-bold text-navy">
                  Déverrouiller l&apos;application ?
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                L&apos;utilisateur pourra naviguer en dehors de l&apos;application.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-11 rounded-xl bg-gray-100 text-sm font-bold text-navy"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmUnlock}
                  className="flex-1 h-11 rounded-xl bg-amber text-sm font-bold text-navy"
                >
                  Déverrouiller
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
