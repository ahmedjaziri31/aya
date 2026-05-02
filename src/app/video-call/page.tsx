"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  PhoneOff,
  Loader2,
  Mic,
  MicOff,
  Video as VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { useCamera } from "@/hooks/useCamera";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { CameraFeed } from "@/components/CameraFeed";
import { SignOverlay, type TranslationResult } from "@/components/SignOverlay";
import { classifyGesture, signDictionary } from "@/lib/signs";

export default function VideoCallPage() {
  const { videoRef, isReady, error: camError, start, stop } = useCamera();
  const {
    landmarksRef,
    handPresent,
    isLoading: mpLoading,
    init,
    startDetection,
    stopDetection,
  } = useMediaPipe(videoRef);
  const {
    init: initPeer,
    callRemote,
    sendTranslation,
    connected: peerConnected,
    remoteStream,
    destroy: destroyPeer,
  } = usePeerConnection("patient");

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const localDetectRef = useRef<ReturnType<typeof setInterval>>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isAiRunningRef = useRef(false);
  const lastAiCallRef = useRef(0);
  const lastLocalGestureRef = useRef<string | null>(null);
  const localStableCountRef = useRef(0);

  // ── LAYER 1: Local instant detection every 100ms ──
  useEffect(() => {
    if (!isActive || !isReady || mpLoading) return;

    localDetectRef.current = setInterval(() => {
      const lm = landmarksRef.current;
      if (!lm || lm.length < 21) {
        localStableCountRef.current = 0;
        lastLocalGestureRef.current = null;
        return;
      }

      const gesture = classifyGesture(lm);

      if (gesture === lastLocalGestureRef.current) {
        localStableCountRef.current++;
      } else {
        lastLocalGestureRef.current = gesture;
        localStableCountRef.current = 1;
      }

      // Show after 2 stable reads (~200ms) for faster response
      if (gesture && localStableCountRef.current >= 2 && signDictionary[gesture]) {
        const sign = signDictionary[gesture];
        const t: TranslationResult = {
          sign: sign.nameFr,
          description: sign.description,
          source: "local",
        };
        setTranslation(t);
        sendTranslation(t);
      }
    }, 100);

    return () => {
      if (localDetectRef.current) clearInterval(localDetectRef.current);
    };
  }, [isActive, isReady, mpLoading, landmarksRef]);

  // ── LAYER 2: AI enrichment in background every 4s ──
  useEffect(() => {
    if (!isActive || !isReady || !handPresent) return;

    const interval = setInterval(() => {
      const timeSinceLast = Date.now() - lastAiCallRef.current;
      if (timeSinceLast > 4000 && !isAiRunningRef.current) {
        runAiTranslation();
      }
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isReady, handPresent]);

  const runAiTranslation = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || isAiRunningRef.current) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, 320, 240);
    const frame = canvas.toDataURL("image/jpeg", 0.5);

    isAiRunningRef.current = true;
    lastAiCallRef.current = Date.now();

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
      });
      const data = await res.json();

      if (data.detected && data.sign) {
        const t: TranslationResult = {
          sign: data.sign,
          description: data.description || "",
          source: "ai",
        };
        setTranslation(t);
        sendTranslation(t);
      }
    } catch {
      // AI failed silently, local translation stays
    } finally {
      isAiRunningRef.current = false;
    }
  }, [videoRef]);

  // Clear translation when hand gone for 2s
  useEffect(() => {
    if (!handPresent) {
      const timeout = setTimeout(() => {
        const empty = null;
        setTranslation(empty);
        sendTranslation(empty as unknown as TranslationResult);
        localStableCountRef.current = 0;
        lastLocalGestureRef.current = null;
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [handPresent, sendTranslation]);

  // Init peer on mount
  useEffect(() => {
    initPeer();
    return () => destroyPeer();
  }, [initPeer, destroyPeer]);

  // Attach remote stream (doctor's camera) to video element
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const handleStart = useCallback(async () => {
    setIsActive(true);
    const stream = await start();
    init();
    timerRef.current = setInterval(
      () => setCallDuration((d) => d + 1),
      1000
    );
    // Call doctor once camera is ready
    if (stream) {
      callRemote(stream);
    }
  }, [start, init, callRemote]);

  useEffect(() => {
    if (isActive && isReady && !mpLoading) {
      startDetection();
    }
    return () => stopDetection();
  }, [isActive, isReady, mpLoading, startDetection, stopDetection]);

  const handleStop = useCallback(() => {
    stopDetection();
    stop();
    destroyPeer();
    setIsActive(false);
    setTranslation(null);
    setCallDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (localDetectRef.current) clearInterval(localDetectRef.current);
  }, [stopDetection, stop, destroyPeer]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (localDetectRef.current) clearInterval(localDetectRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  /* ── Pre-call screen ── */
  if (!isActive) {
    return (
      <div className="min-h-full flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-14 pb-4">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-navy" />
          </Link>
          <h1 className="text-lg font-bold text-navy">Video Consultation</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6 pb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-navy flex items-center justify-center">
              <span className="text-5xl">👨‍⚕️</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-success border-[3px] border-background" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-black text-navy">Dr. Mansour</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Oto-rhino-laryngologiste
            </p>
          </div>

          {camError && (
            <div className="bg-danger/10 text-danger text-xs rounded-xl px-4 py-2 text-center">
              {camError}
            </div>
          )}

          <button
            onClick={handleStart}
            className="bg-success text-white px-10 py-4 rounded-full text-sm font-bold flex items-center gap-3 active:scale-[0.97] transition-transform shadow-lg shadow-success/30"
          >
            <VideoIcon size={20} />
            Lancer l&apos;appel vidéo
          </button>

          <div className="bg-amber-pale border border-amber-light/30 rounded-2xl p-4 w-full max-w-sm mt-2">
            <p className="text-[10px] font-bold text-amber uppercase tracking-wider mb-2">
              Traduction IA en temps réel
            </p>
            <p className="text-[11px] text-navy leading-relaxed">
              Détection instantanée des gestes + enrichissement IA pour une traduction naturelle.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active call: fixed full-screen ── */
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <CameraFeed ref={videoRef} />

      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none" />

      <div className="absolute top-0 inset-x-0 z-20 px-5 pt-12 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success font-bold uppercase tracking-wider">
              En direct
            </span>
          </div>
          <h2 className="text-white text-base font-bold mt-0.5">
            Dr. Mansour
          </h2>
          <p className="text-white/50 text-[10px]">
            Oto-rhino-laryngologiste
          </p>
        </div>
        <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
          <span className="text-white text-xs font-bold font-mono">
            {formatTime(callDuration)}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {mpLoading && (
          <motion.div
            key="mp-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black/50 flex flex-col items-center justify-center gap-3"
          >
            <Loader2 size={36} className="text-amber animate-spin" />
            <p className="text-white text-xs font-medium">
              Chargement de la détection IA...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-28 left-5 z-20 flex flex-col gap-2">
        {isReady && !mpLoading && (
          <motion.span
            key="badge-ready"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-success/90 text-white text-[9px] font-bold px-3 py-1 rounded-full inline-block"
          >
            Visage bien éclairé
          </motion.span>
        )}
        <AnimatePresence>
          {handPresent && (
            <motion.span
              key="badge-hand"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-amber/90 text-navy text-[9px] font-bold px-3 py-1 rounded-full inline-block"
            >
              ✋ Main détectée
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-28 right-5 z-20 w-[72px] h-24 rounded-2xl bg-navy overflow-hidden border-2 border-white/20 shadow-lg">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-2xl">👨‍⚕️</span>
            <span className="text-[7px] text-white/60 mt-0.5 font-medium">
              {peerConnected ? "Dr. Mansour" : "En attente..."}
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-none">
        <div className="h-72 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="absolute bottom-0 inset-x-0 z-30">
        <div className="px-5 mb-4">
          <SignOverlay
            translation={translation}
            handDetected={handPresent}
          />
        </div>

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
              onClick={handleStop}
              className="w-16 h-16 rounded-full bg-danger flex items-center justify-center shadow-lg shadow-danger/40 active:scale-95 transition-transform"
            >
              <PhoneOff size={26} className="text-white" />
            </button>

            <button className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
              <Camera size={22} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
