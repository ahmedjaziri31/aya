"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Peer, { type DataConnection, type MediaConnection } from "peerjs";

const PATIENT_PEER_ID = "aya-patient-demo";
const DOCTOR_PEER_ID = "aya-doctor-demo";
const POLL_INTERVAL = 2500;
const RECONNECT_DELAY = 3000;

export type PeerRole = "patient" | "doctor";

interface TranslationData {
  sign: string;
  description: string;
  source: "local" | "ai";
}

export function usePeerConnection(role: PeerRole) {
  const peerRef = useRef<Peer | null>(null);
  const dataConnRef = useRef<DataConnection | null>(null);
  const mediaConnRef = useRef<MediaConnection | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const destroyedRef = useRef(false);
  const connectedRef = useRef(false);
  const initializingRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteTranslation, setRemoteTranslation] = useState<TranslationData | null>(null);
  const [peerReady, setPeerReady] = useState(false);

  const myId = role === "patient" ? PATIENT_PEER_ID : DOCTOR_PEER_ID;
  const remoteId = role === "patient" ? DOCTOR_PEER_ID : PATIENT_PEER_ID;

  const markConnected = useCallback((val: boolean) => {
    connectedRef.current = val;
    setConnected(val);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const setupDataConn = useCallback((conn: DataConnection) => {
    dataConnRef.current = conn;

    conn.on("open", () => {
      if (destroyedRef.current) return;
      markConnected(true);
      stopPolling();
    });

    conn.on("data", (data) => {
      const parsed = data as { type: string; payload: TranslationData | null };
      if (parsed.type === "translation") {
        setRemoteTranslation(parsed.payload);
      }
    });

    conn.on("close", () => {
      if (destroyedRef.current) return;
      markConnected(false);
      dataConnRef.current = null;
      startPolling();
    });

    conn.on("error", () => {
      if (destroyedRef.current) return;
      markConnected(false);
      dataConnRef.current = null;
    });
  }, [markConnected, stopPolling]);

  const setupMediaConn = useCallback((call: MediaConnection) => {
    mediaConnRef.current = call;
    call.on("stream", (remote) => setRemoteStream(remote));
    call.on("close", () => {
      setRemoteStream(null);
      mediaConnRef.current = null;
    });
    call.on("error", () => {
      setRemoteStream(null);
      mediaConnRef.current = null;
    });
  }, []);

  const attemptConnect = useCallback(() => {
    const peer = peerRef.current;
    if (!peer || destroyedRef.current || connectedRef.current) return;
    if (!peer.open) return;

    // Attempt data connection
    const dataConn = peer.connect(remoteId, { reliable: true });
    setupDataConn(dataConn);

    // Attempt media connection if we have a local stream
    const stream = localStreamRef.current;
    if (stream) {
      const mediaConn = peer.call(remoteId, stream);
      if (mediaConn) {
        setupMediaConn(mediaConn);
      }
    }
  }, [remoteId, setupDataConn, setupMediaConn]);

  const startPolling = useCallback(() => {
    stopPolling();
    if (destroyedRef.current) return;

    pollTimerRef.current = setInterval(() => {
      if (connectedRef.current || destroyedRef.current) {
        stopPolling();
        return;
      }
      attemptConnect();
    }, POLL_INTERVAL);

    // Also try immediately
    attemptConnect();
  }, [stopPolling, attemptConnect]);

  // Make startPolling available to setupDataConn via ref
  const startPollingRef = useRef(startPolling);
  startPollingRef.current = startPolling;

  const init = useCallback(() => {
    if (peerRef.current || initializingRef.current) return;
    initializingRef.current = true;
    destroyedRef.current = false;

    const peer = new Peer(myId, {
      debug: 0,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      },
    });

    peer.on("open", () => {
      if (destroyedRef.current) return;
      initializingRef.current = false;
      setPeerReady(true);
      // Start polling to find the other peer
      startPollingRef.current();
    });

    // Incoming data connection from the other peer
    peer.on("connection", (conn) => {
      if (destroyedRef.current) return;
      setupDataConn(conn);
    });

    // Incoming media call from the other peer
    peer.on("call", (call) => {
      if (destroyedRef.current) return;
      const stream = localStreamRef.current;
      if (stream) {
        call.answer(stream);
      } else {
        // Answer without stream, get their stream
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "user" }, audio: false })
          .then((s) => {
            localStreamRef.current = s;
            call.answer(s);
          })
          .catch(() => {
            call.answer();
          });
      }
      setupMediaConn(call);
    });

    peer.on("error", (err) => {
      if (destroyedRef.current) return;
      initializingRef.current = false;

      if (err.type === "unavailable-id") {
        // Our ID is taken (stale session), destroy and retry
        peer.destroy();
        peerRef.current = null;
        setTimeout(() => {
          if (!destroyedRef.current) init();
        }, RECONNECT_DELAY);
        return;
      }

      if (err.type === "peer-unavailable") {
        // Remote peer not online yet — polling will retry
        return;
      }

      if (err.type === "disconnected" || err.type === "network") {
        // Try to reconnect
        setTimeout(() => {
          if (!destroyedRef.current && peerRef.current && !peerRef.current.destroyed) {
            peerRef.current.reconnect();
          }
        }, RECONNECT_DELAY);
      }
    });

    peer.on("disconnected", () => {
      if (destroyedRef.current) return;
      setPeerReady(false);
      markConnected(false);
      // Auto-reconnect
      setTimeout(() => {
        if (!destroyedRef.current && peerRef.current && !peerRef.current.destroyed) {
          peerRef.current.reconnect();
        }
      }, RECONNECT_DELAY);
    });

    peer.on("close", () => {
      if (destroyedRef.current) return;
      setPeerReady(false);
      markConnected(false);
    });

    peerRef.current = peer;
  }, [myId, markConnected, setupDataConn, setupMediaConn]);

  const callRemote = useCallback(
    (localStream: MediaStream) => {
      localStreamRef.current = localStream;
      // If already connected via data, initiate media call
      if (connectedRef.current && peerRef.current?.open) {
        const mediaConn = peerRef.current.call(remoteId, localStream);
        if (mediaConn) {
          setupMediaConn(mediaConn);
        }
      }
      // Otherwise polling will pick it up
      startPollingRef.current();
    },
    [remoteId, setupMediaConn]
  );

  const sendTranslation = useCallback((data: TranslationData | null) => {
    if (dataConnRef.current?.open) {
      dataConnRef.current.send({ type: "translation", payload: data });
    }
  }, []);

  const destroy = useCallback(() => {
    destroyedRef.current = true;
    initializingRef.current = false;
    stopPolling();
    localStreamRef.current = null;
    dataConnRef.current?.close();
    mediaConnRef.current?.close();
    peerRef.current?.destroy();
    peerRef.current = null;
    markConnected(false);
    setRemoteStream(null);
    setPeerReady(false);
  }, [stopPolling, markConnected]);

  useEffect(() => {
    return () => {
      destroyedRef.current = true;
      stopPolling();
      peerRef.current?.destroy();
    };
  }, [stopPolling]);

  return {
    init,
    callRemote,
    sendTranslation,
    destroy,
    connected,
    remoteStream,
    remoteTranslation,
    peerReady,
  };
}
