"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { PaymentForm } from "@/components/PaymentForm";

export default function PaymentPage() {
  const [paid, setPaid] = useState(false);

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
        <h1 className="text-lg font-bold text-navy">Paiement</h1>
      </div>

      <AnimatePresence mode="wait">
        {!paid ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 px-5 pb-6"
          >
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">
                Résumé de la commande
              </p>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-muted-foreground">
                  Abonnement Ismaani Premium
                </span>
                <span className="text-xs font-bold text-navy">
                  40,000 TND
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-muted-foreground">
                  Frais de service
                </span>
                <span className="text-xs font-bold text-navy">5,000 TND</span>
              </div>
              <div className="flex items-center justify-between py-2 mt-1">
                <span className="text-sm font-black text-navy">Total</span>
                <span className="text-sm font-black text-amber">
                  45,000 TND
                </span>
              </div>
            </div>

            <PaymentForm onSuccess={() => setPaid(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="flex-1 flex flex-col items-center justify-center px-5 pb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 12 }}
              className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
            >
              <CheckCircle2 size={44} className="text-success" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h2 className="text-xl font-black text-navy">
                Paiement réussi !
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-[260px]">
                Votre abonnement Ismaani Premium est maintenant actif
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 bg-amber-pale border border-amber-light/30 rounded-2xl p-4 flex items-center gap-3 w-full max-w-sm"
            >
              <Sparkles size={18} className="text-amber shrink-0" />
              <p className="text-xs text-navy leading-relaxed">
                Accès illimité à la traduction vidéo, modules d&apos;apprentissage et assistance prioritaire
              </p>
            </motion.div>

            <Link
              href="/"
              className="mt-8 bg-navy text-white px-8 py-3.5 rounded-2xl text-sm font-bold active:scale-[0.97] transition-transform"
            >
              Retour à l&apos;accueil
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
