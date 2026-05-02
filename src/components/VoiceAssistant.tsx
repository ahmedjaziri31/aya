"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

type AssistantState = "idle" | "listening" | "thinking" | "speaking";

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AssistantState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  const hidden = pathname === "/" || pathname === "/video-call" || pathname === "/doctor";

  const handleAction = useCallback(
    (action: string) => {
      if (action.startsWith("navigate:")) {
        const path = action.replace("navigate:", "");
        setTimeout(() => {
          router.push(path);
          setIsOpen(false);
          setState("idle");
        }, 2000);
      } else if (action.startsWith("call:")) {
        const number = action.replace("call:", "");
        setTimeout(() => {
          window.location.href = `tel:${number}`;
        }, 2000);
      }
    },
    [router]
  );

  const sendToAPI = useCallback(
    async (text: string) => {
      setState("thinking");
      setTranscript(text);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        const reply = data.text || "Désolé, je n'ai pas compris.";

        setResponse(reply);
        setState("speaking");

        if ("speechSynthesis" in window) {
          speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(reply);
          utterance.lang = "fr-FR";
          utterance.rate = 0.95;
          utterance.pitch = 1;
          utterance.onend = () => setState("idle");
          speechSynthesis.speak(utterance);
        } else {
          setTimeout(() => setState("idle"), 3000);
        }

        if (data.action) {
          handleAction(data.action);
        }
      } catch {
        setResponse("Erreur de connexion.");
        setState("speaking");
        setTimeout(() => setState("idle"), 2000);
      }
    },
    [handleAction]
  );

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResponse("La reconnaissance vocale n'est pas supportée.");
      setState("speaking");
      setTimeout(() => setState("idle"), 2000);
      return;
    }

    setState("listening");
    setTranscript("");
    setResponse("");

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string }; isFinal?: boolean } }; resultIndex: number }) => {
      const result = event.results[event.resultIndex];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        sendToAPI(text);
      }
    };

    recognition.onerror = () => {
      setState("idle");
      setTranscript("");
    };

    recognition.onend = () => {
      if (state === "listening") {
        // If ended without result, go idle
        setState((s) => (s === "listening" ? "idle" : s));
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [sendToAPI, state]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
    setTranscript("");
  }, []);

  const handleOrbTap = useCallback(() => {
    if (state === "listening") {
      stopListening();
    } else if (state === "idle") {
      startListening();
    }
  }, [state, startListening, stopListening]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      recognitionRef.current?.stop();
      speechSynthesis?.cancel();
      setState("idle");
      setTranscript("");
      setResponse("");
    }
  }, [isOpen]);

  if (hidden) return null;

  const orbSize = state === "listening" ? 120 : state === "thinking" ? 100 : state === "speaking" ? 110 : 100;

  const stateLabel = {
    idle: "Appuyez pour parler",
    listening: "Je vous écoute...",
    thinking: "Je réfléchis...",
    speaking: "",
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-navy shadow-lg shadow-navy/30 flex items-center justify-center"
          >
            <Mic size={22} className="text-amber" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full-screen voice panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-between bg-navy overflow-hidden"
          >
            {/* Background animated rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white/[0.04]"
                  style={{ width: 200 + i * 80, height: 200 + i * 80 }}
                  animate={{
                    scale: state === "listening" || state === "speaking"
                      ? [1, 1.05 + i * 0.02, 1]
                      : 1,
                    opacity: state === "idle" ? 0.3 : 0.6,
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <div className="w-full flex justify-end px-5 pt-14">
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X size={18} className="text-white/70" />
              </button>
            </div>

            {/* Center: Orb + Text */}
            <div className="flex flex-col items-center gap-8">
              {/* Animated orb */}
              <div className="relative flex items-center justify-center">
                {/* Pulse rings when active */}
                <AnimatePresence>
                  {(state === "listening" || state === "speaking") && (
                    <>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={`pulse-${i}`}
                          className={`absolute rounded-full ${
                            state === "listening"
                              ? "bg-amber/20"
                              : "bg-white/10"
                          }`}
                          style={{ width: orbSize, height: orbSize }}
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{
                            scale: [1, 1.5 + i * 0.2],
                            opacity: [0.4, 0],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>

                {/* Main orb */}
                <motion.button
                  onClick={handleOrbTap}
                  animate={{
                    width: orbSize,
                    height: orbSize,
                    scale: state === "thinking" ? [1, 0.95, 1] : 1,
                  }}
                  transition={
                    state === "thinking"
                      ? { scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }
                      : { type: "spring", stiffness: 200, damping: 15 }
                  }
                  className={`relative z-10 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-500 ${
                    state === "listening"
                      ? "bg-amber shadow-amber/30"
                      : state === "thinking"
                        ? "bg-white/10 shadow-white/10"
                        : state === "speaking"
                          ? "bg-white/15 shadow-white/10"
                          : "bg-white/10 shadow-none"
                  }`}
                >
                  {state === "thinking" ? (
                    <motion.div
                      className="flex gap-1.5"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full bg-amber"
                          animate={{ y: [-3, 3, -3] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </motion.div>
                  ) : state === "speaking" ? (
                    <div className="flex items-end gap-[3px] h-8">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-[3px] bg-amber rounded-full"
                          animate={{
                            height: [8, 20 + Math.random() * 12, 8],
                          }}
                          transition={{
                            duration: 0.5 + Math.random() * 0.3,
                            repeat: Infinity,
                            delay: i * 0.08,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Mic
                      size={state === "listening" ? 36 : 30}
                      className={`transition-colors duration-300 ${
                        state === "listening" ? "text-navy" : "text-white/60"
                      }`}
                    />
                  )}
                </motion.button>
              </div>

              {/* Status text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={state + transcript + response}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-center px-8 max-w-sm"
                >
                  {state === "speaking" && response ? (
                    <p className="text-white text-base font-medium leading-relaxed">
                      &quot;{response}&quot;
                    </p>
                  ) : transcript ? (
                    <p className="text-amber text-lg font-bold">
                      {transcript}
                    </p>
                  ) : (
                    <p className="text-white/40 text-sm">
                      {stateLabel[state]}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom hint */}
            <div className="pb-12">
              <AnimatePresence>
                {state === "idle" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white/20 text-[11px] text-center max-w-[240px] leading-relaxed"
                  >
                    Dites &quot;SOS&quot;, &quot;Appeler la famille&quot;, &quot;Apprendre les salutations&quot;...
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
