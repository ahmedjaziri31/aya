"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Phone, Heart } from "lucide-react";
import Link from "next/link";
import { SOSButton, ServiceCard } from "@/components/SOSButton";
import { emergencyServices } from "@/lib/emergency";

export default function SOSPage() {
  const [showServices, setShowServices] = useState(false);

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-navy" />
        </Link>
        <h1 className="text-lg font-bold text-navy">Urgence SOS</h1>
      </div>

      {/* Alert Banner */}
      <div className="mx-5 mb-6">
        <div className="bg-amber-pale border border-amber-light/40 rounded-2xl px-4 py-3">
          <p className="text-[11px] font-bold text-navy uppercase tracking-wider">
            Alertes visuelles & haptiques activées
          </p>
        </div>
      </div>

      {/* SOS Button Area */}
      <AnimatePresence mode="wait">
        {!showServices ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex items-center justify-center"
          >
            <SOSButton
              onPress={() => setShowServices(true)}
              isActive={showServices}
            />
          </motion.div>
        ) : (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 px-5"
          >
            <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">
              Signalement visuel
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {emergencyServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Family Call */}
            <motion.a
              href="tel:+21658613572"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 flex items-center gap-4 bg-amber-pale border border-amber-light/40 rounded-2xl p-4 active:bg-amber-light/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-amber flex items-center justify-center shrink-0">
                <Heart size={22} className="text-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-navy">Appel Famille</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Contact de confiance
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber text-navy px-3 py-1.5 rounded-full shrink-0">
                <Phone size={12} strokeWidth={2.5} />
                <span className="text-[11px] font-bold">Appeler</span>
              </div>
            </motion.a>

            {/* Location */}
            <div className="mt-5 bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
              <MapPin size={18} className="text-navy shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Position actuelle
                </p>
                <p className="text-xs text-navy font-medium mt-0.5">
                  Avenue Habib Bourguiba, Tunis
                </p>
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={() => setShowServices(false)}
              className="w-full mt-4 py-3 rounded-2xl bg-navy text-white text-sm font-bold active:bg-navy-light transition-colors"
            >
              Retour
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Info Card */}
      <div className="px-5 pb-6 mt-auto pt-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🏥</span>
            <p className="text-[11px] font-bold text-navy uppercase tracking-wider">
              Informations médicales critiques
            </p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Groupe sanguin
              </p>
              <p className="text-lg font-black text-navy">
                A+ <span className="text-xs text-muted font-normal">(O+)</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Allergies
              </p>
              <p className="text-lg font-black text-danger">Pénicilline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
