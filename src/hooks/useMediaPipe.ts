"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

interface Landmark {
  x: number;
  y: number;
  z: number;
}

const TARGET_FPS = 15;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function useMediaPipe(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const landmarksRef = useRef<Landmark[]>([]);
  const [handPresent, setHandPresent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevHandPresent = useRef(false);
  const lastFrameTime = useRef(0);

  const init = useCallback(async () => {
    try {
      setIsLoading(true);
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });
      handLandmarkerRef.current = landmarker;
      setIsLoading(false);
    } catch (err) {
      console.error("MediaPipe init error:", err);
      setError("Erreur de chargement du modèle de détection.");
      setIsLoading(false);
    }
  }, []);

  const startDetection = useCallback(() => {
    const detect = (now: number) => {
      const elapsed = now - lastFrameTime.current;

      if (elapsed >= FRAME_INTERVAL) {
        lastFrameTime.current = now - (elapsed % FRAME_INTERVAL);

        const video = videoRef.current;
        const landmarker = handLandmarkerRef.current;

        if (video && landmarker && video.readyState >= 2) {
          const result = landmarker.detectForVideo(video, now);
          const hasHand = !!(result.landmarks && result.landmarks.length > 0);

          if (hasHand) {
            landmarksRef.current = result.landmarks[0];
          } else {
            landmarksRef.current = [];
          }

          if (hasHand !== prevHandPresent.current) {
            prevHandPresent.current = hasHand;
            setHandPresent(hasHand);
          }
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    };
    rafRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  const stopDetection = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
      handLandmarkerRef.current?.close();
    };
  }, [stopDetection]);

  return {
    landmarksRef,
    handPresent,
    isLoading,
    error,
    init,
    startDetection,
    stopDetection,
  };
}
