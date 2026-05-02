"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Video,
  ShieldCheck,
  Hand,
} from "lucide-react";

const ONBOARDING_SLIDES = [
  {
    icon: Hand,
    title: "Bienvenue sur Ismaani",
    subtitle: "Communication accessible pour tous",
    description:
      "La première plateforme tunisienne de traduction en langue des signes, alimentée par l'intelligence artificielle.",
    iconBg: "bg-navy",
  },
  {
    icon: Video,
    title: "Appel Vidéo Intelligent",
    subtitle: "Traduction en temps réel",
    description:
      "Consultez votre médecin en vidéo. L'IA traduit automatiquement la langue des signes en français.",
    iconBg: "bg-teal",
  },
  {
    icon: ShieldCheck,
    title: "SOS & Sécurité",
    subtitle: "Aide en un geste",
    description:
      "Contactez les services d'urgence instantanément. Protection Civile, Police, SAMU — un seul appui.",
    iconBg: "bg-danger",
  },
];

export default function Home() {
  const [step, setStep] = useState<"onboarding" | "code">("onboarding");
  const [slideIndex, setSlideIndex] = useState(0);
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isLastSlide = slideIndex === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      setStep("code");
    } else {
      setSlideIndex((i) => i + 1);
    }
  };

  useEffect(() => {
    const fullCode = code.join("");
    if (fullCode.length === 4) {
      handleCodeSubmit(fullCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleCodeSubmit = (fullCode: string) => {
    setError("");
    if (fullCode === "0031") {
      setIsLoading(true);
      router.replace("/doctor");
    } else if (fullCode === "0041") {
      setIsLoading(true);
      router.replace("/hub");
    } else {
      setError("Code invalide");
      setCode(["", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {step === "onboarding" ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm"
          >
            <AnimatePresence mode="wait">
              {(() => {
                const slide = ONBOARDING_SLIDES[slideIndex];
                const Icon = slide.icon;
                return (
                  <motion.div
                    key={slideIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="text-center mb-10"
                  >
                    <div
                      className={`w-20 h-20 rounded-2xl ${slide.iconBg} flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    >
                      <Icon size={36} className="text-white" strokeWidth={1.8} />
                    </div>
                    <h1 className="text-2xl font-black text-navy">
                      {slide.title}
                    </h1>
                    <p className="text-amber text-[10px] font-bold uppercase tracking-[2px] mt-2">
                      {slide.subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-[300px] mx-auto">
                      {slide.description}
                    </p>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {ONBOARDING_SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === slideIndex
                      ? "w-6 bg-navy"
                      : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-navy text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {isLastSlide ? "Commencer" : "Suivant"}
              <ArrowRight size={16} />
            </button>

            {!isLastSlide && (
              <button
                onClick={() => setStep("code")}
                className="w-full mt-3 text-xs text-muted hover:text-muted-foreground transition-colors py-2"
              >
                Passer
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm"
          >
            {/* Logo */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center mx-auto mb-4 shadow-lg shadow-navy/20">
                <span className="text-amber text-xl font-black">IS</span>
              </div>
              <h1 className="text-2xl font-black text-navy">Ismaani</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Entrez votre code d&apos;accès
              </p>
            </div>

            {/* PIN input */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  className={`w-14 h-16 rounded-2xl text-center text-2xl font-black bg-white border-2 focus:outline-none transition-all ${
                    error
                      ? "border-danger"
                      : digit
                        ? "border-navy"
                        : "border-gray-200 focus:border-amber focus:ring-4 focus:ring-amber/10"
                  }`}
                  style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                />
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-danger text-center mb-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {isLoading && (
              <p className="text-xs text-navy text-center font-medium animate-pulse">
                Connexion en cours...
              </p>
            )}

            <div className="mt-16 text-center">
              <p className="text-[10px] text-muted">
                Contactez votre administrateur pour obtenir un code
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
