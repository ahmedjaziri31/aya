export interface EmergencyService {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  icon: "fire" | "police" | "ambulance" | "help";
  color: string;
  bgColor: string;
}

export const emergencyServices: EmergencyService[] = [
  {
    id: "protection-civile",
    name: "Protection Civile",
    nameAr: "الحماية المدنية",
    phone: "198",
    icon: "fire",
    color: "#EF4444",
    bgColor: "#FEF2F2",
  },
  {
    id: "police",
    name: "Police / Sûreté",
    nameAr: "الشرطة",
    phone: "197",
    icon: "police",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
  },
  {
    id: "samu",
    name: "Ambulance SAMU",
    nameAr: "الإسعاف",
    phone: "190",
    icon: "ambulance",
    color: "#22C55E",
    bgColor: "#F0FDF4",
  },
  {
    id: "aide",
    name: "Aide & Protection",
    nameAr: "طلب المساعدة",
    phone: "1899",
    icon: "help",
    color: "#A855F7",
    bgColor: "#FAF5FF",
  },
];
