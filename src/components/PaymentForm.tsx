"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Lock } from "lucide-react";

export function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsProcessing(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Preview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-5 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-bold tracking-widest opacity-70">
            CARTE BANCAIRE
          </span>
          <CreditCard size={24} className="opacity-70" />
        </div>
        <p className="text-lg font-mono tracking-[3px] mb-4">
          {cardNumber || "•••• •••• •••• ••••"}
        </p>
        <div className="flex justify-between text-xs">
          <div>
            <p className="text-[9px] opacity-50 uppercase">Titulaire</p>
            <p className="font-medium mt-0.5">{name || "NOM PRÉNOM"}</p>
          </div>
          <div>
            <p className="text-[9px] opacity-50 uppercase">Expire</p>
            <p className="font-medium mt-0.5">{expiry || "MM/AA"}</p>
          </div>
        </div>
      </motion.div>

      {/* Input Fields */}
      <div>
        <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
          Numéro de carte
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy placeholder:text-muted focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
          Nom du titulaire
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          placeholder="NOM PRÉNOM"
          className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy placeholder:text-muted focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
            Expiration
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/AA"
            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy placeholder:text-muted focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all"
          />
        </div>
        <div className="w-28">
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
            CVV
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="123"
            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy placeholder:text-muted focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full h-14 rounded-2xl bg-amber text-navy text-sm font-black flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60"
      >
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full"
          />
        ) : (
          <>
            <Lock size={14} />
            Payer 45,000 TND
          </>
        )}
      </button>

      <p className="text-[10px] text-muted text-center flex items-center justify-center gap-1">
        <Lock size={10} />
        Paiement sécurisé - Données chiffrées
      </p>
    </form>
  );
}
