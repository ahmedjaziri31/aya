"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import type { EmergencyService } from "@/lib/emergency";

const iconMap: Record<EmergencyService["icon"], string> = {
  fire: "🔥",
  police: "🛡️",
  ambulance: "🚑",
  help: "💜",
};

export function SOSButton({
  onPress,
  isActive,
}: {
  onPress: () => void;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-navy/10"
          animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-navy/10"
          animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
        />

        {/* Main button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onTap={onPress}
          className="relative w-40 h-40 rounded-full bg-navy shadow-xl flex flex-col items-center justify-center z-10 border-[6px] border-gray-200"
        >
          <span className="text-amber text-4xl font-black">✳</span>
          <span className="text-white text-2xl font-black mt-1">SOS</span>
        </motion.button>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-[220px] leading-relaxed">
        Appuyez pour afficher les services d&apos;urgence
      </p>
    </div>
  );
}

export function ServiceCard({ service }: { service: EmergencyService }) {
  return (
    <motion.a
      href={`tel:${service.phone}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.96 }}
      className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: service.bgColor }}
      >
        {iconMap[service.icon]}
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-navy">{service.name}</p>
        <p className="text-[10px] text-muted mt-0.5">{service.nameAr}</p>
      </div>
      <div
        className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white mt-1"
        style={{ backgroundColor: service.color }}
      >
        <Phone size={10} />
        {service.phone}
      </div>
    </motion.a>
  );
}
