"use client";

import { forwardRef } from "react";

export const CameraFeed = forwardRef<HTMLVideoElement>(function CameraFeed(
  _props,
  ref
) {
  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover"
      playsInline
      muted
      autoPlay
      style={{ transform: "scaleX(-1)" }}
    />
  );
});
