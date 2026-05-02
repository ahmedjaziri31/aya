"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Video, BookOpen, AlertCircle, CreditCard } from "lucide-react";

const features = [
  {
    href: "/video-call",
    icon: Video,
    title: "Appel Vidéo",
    subtitle: "Traduction IA en temps réel",
    color: "bg-teal",
  },
  {
    href: "/sos",
    icon: AlertCircle,
    title: "SOS Urgences",
    subtitle: "Appel rapide aux services",
    color: "bg-danger",
  },
  {
    href: "/e-learning",
    icon: BookOpen,
    title: "Apprendre",
    subtitle: "Cours de langue des signes",
    color: "bg-amber",
  },
  {
    href: "/payment",
    icon: CreditCard,
    title: "Abonnement",
    subtitle: "Ismaani Premium",
    color: "bg-navy",
  },
];

export default function HubPage() {
  return (
    <div className="min-h-full px-5 pt-14 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-black text-navy">Ismaani</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Choisissez un service
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={f.href}
                className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-[0.97] transition-transform h-full"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-3`}
                >
                  <Icon size={20} className="text-white" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-navy leading-tight">
                  {f.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {f.subtitle}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
