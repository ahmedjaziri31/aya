"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Loader2, Mic, MicOff } from "lucide-react";
import { usePeerConnection } from "@/hooks/usePeerConnection";

interface Translation {
  sign: string;
  description: string;
  source: "local" | "ai";
}

export default function DoctorPage() {
  const {
    init,
    connected,
    remoteStream,
    remoteTranslation,
    peerReady,
    destroy,
    callRemote,
  } = usePeerConnection("doctor");

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Init peer on mount
  useEffect(() => {
    init();
  }, [init]);

  // Start own camera and share it for auto-connect
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
        callRemote(stream);
      })
      .catch(() => {});

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callRemote]);

  // Attach remote stream to video
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Call timer
  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(
        () => setCallDuration((d) => d + 1),
        1000
      );
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connected]);

  const handleEnd = useCallback(() => {
    destroy();
    localStream?.getTracks().forEach((t) => t.stop());
    window.location.href = "/";
  }, [destroy, localStream]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const translation = remoteTranslation as Translation | null;

  /* ── Waiting for patient ── */
  if (!connected) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="text-navy animate-spin" />
          </div>

          <h1 className="text-xl font-black text-navy">Espace Médecin</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-[260px] leading-relaxed">
            En attente du patient...
          </p>

          <div className="mt-6 flex items-center gap-2 justify-center">
            <div className={`w-2 h-2 rounded-full ${peerReady ? "bg-success animate-pulse" : "bg-muted"}`} />
            <span className="text-[11px] text-muted-foreground">
              {peerReady ? "Connecté au serveur — prêt" : "Connexion..."}
            </span>
          </div>

          {/* Own camera preview */}
          <div className="mt-8 w-48 h-36 rounded-2xl bg-black overflow-hidden mx-auto border-2 border-gray-200">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
          <p className="text-[10px] text-muted mt-2">Votre caméra</p>
        </motion.div>
      </div>
    );
  }

  /* ── Active call ── */
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Patient's video — full screen */}
      <video
        ref={remoteVideoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
      />

      {/* Top gradient */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 px-5 pt-12 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success font-bold uppercase tracking-wider">
              En direct — Médecin
            </span>
          </div>
          <h2 className="text-white text-base font-bold mt-0.5">
            Patient connecté
          </h2>
          <p className="text-white/50 text-[10px]">
            Traduction langue des signes active
          </p>
        </div>
        <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
          <span className="text-white text-xs font-bold font-mono">
            {formatTime(callDuration)}
          </span>
        </div>
      </div>

      {/* Doctor's own PiP camera */}
      <div className="absolute top-28 right-5 z-20 w-[72px] h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
        <video
          ref={localVideoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-none">
        <div className="h-72 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Translation overlay + controls */}
      <div className="absolute bottom-0 inset-x-0 z-30">
        {/* Translation from patient */}
        <div className="px-5 mb-4">
          <AnimatePresence mode="wait">
            {translation ? (
              <motion.div
                key={translation.sign}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider">
                      Patient dit (LS)
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
                {translation.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {translation.description}
                  </p>
                )}
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
                  En attente de signes du patient...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="pb-10 pt-2 safe-bottom">
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-danger/80 backdrop-blur-md"
                  : "bg-white/15 backdrop-blur-md"
              }`}
            >
              {isMuted ? (
                <MicOff size={22} className="text-white" />
              ) : (
                <Mic size={22} className="text-white" />
              )}
            </button>

            <button
              onClick={handleEnd}
              className="w-16 h-16 rounded-full bg-danger flex items-center justify-center shadow-lg shadow-danger/40 active:scale-95 transition-transform"
            >
              <PhoneOff size={26} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
