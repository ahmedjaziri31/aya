export interface Lesson {
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  lessonsCount: number;
  steps: LessonStep[];
}

export interface LessonStep {
  title: string;
  description: string;
  signEmoji: string;
  tip?: string;
}

export const categories = [
  { id: "urgences", name: "Urgences Médicales", icon: "⭐", color: "#EF4444", bgColor: "#FEF2F2" },
  { id: "famille", name: "Famille et Amis", icon: "👥", color: "#8B5CF6", bgColor: "#FAF5FF" },
  { id: "admin", name: "Administrations", icon: "🏛️", color: "#1B2A4A", bgColor: "#EFF6FF" },
  { id: "quotidien", name: "Vocabulaire Quotidien", icon: "💬", color: "#0D9488", bgColor: "#F0FDFA" },
] as const;

export const lessons: Lesson[] = [
  {
    slug: "salutations",
    title: "Salutations de Base",
    description: "Apprenez à dire bonjour, au revoir et les formules de politesse courantes.",
    category: "quotidien",
    categoryIcon: "💬",
    lessonsCount: 5,
    steps: [
      {
        title: "Bonjour",
        description: "Levez la main ouverte, paume vers l'avant, et inclinez-la légèrement vers l'avant. Un geste simple et universel.",
        signEmoji: "👋",
        tip: "Le contact visuel est essentiel en LST pour marquer le respect.",
      },
      {
        title: "Au revoir",
        description: "Ouvrez et fermez la main à plusieurs reprises, comme un geste d'adieu naturel.",
        signEmoji: "🤚",
      },
      {
        title: "Merci",
        description: "Portez les doigts de la main droite au menton, puis baissez-la vers l'avant avec un léger sourire.",
        signEmoji: "🙏",
        tip: "L'expression faciale accompagne toujours le signe en LST.",
      },
      {
        title: "S'il vous plaît",
        description: "Faites un cercle sur la poitrine avec la main ouverte, dans le sens des aiguilles d'une montre.",
        signEmoji: "🤲",
      },
      {
        title: "Comment ça va ?",
        description: "Pointez vers l'interlocuteur, puis faites un pouce levé avec une expression interrogative.",
        signEmoji: "👍",
      },
    ],
  },
  {
    slug: "urgences-medicales",
    title: "Urgences Médicales",
    description: "Signes vitaux pour communiquer avec les professionnels de la santé.",
    category: "urgences",
    categoryIcon: "⭐",
    lessonsCount: 4,
    steps: [
      {
        title: "J'ai mal",
        description: "Pointez l'index vers la zone de douleur, avec une expression de souffrance sur le visage.",
        signEmoji: "😣",
        tip: "En urgence, l'expression faciale est aussi importante que le signe.",
      },
      {
        title: "Aide / Au secours",
        description: "Agitez les deux mains au-dessus de la tête, paumes vers l'extérieur.",
        signEmoji: "🆘",
      },
      {
        title: "Médicament",
        description: "Mimez le geste de prendre un comprimé et de le porter à la bouche.",
        signEmoji: "💊",
      },
      {
        title: "Hôpital",
        description: "Dessinez une croix sur le bras avec l'index de l'autre main.",
        signEmoji: "🏥",
      },
    ],
  },
  {
    slug: "famille-amis",
    title: "Famille et Amis",
    description: "Vocabulaire social et relations familiales tunisiennes.",
    category: "famille",
    categoryIcon: "👥",
    lessonsCount: 5,
    steps: [
      {
        title: "Mère / Maman",
        description: "Tapez deux fois le menton avec le pouce de la main ouverte.",
        signEmoji: "👩",
      },
      {
        title: "Père / Papa",
        description: "Tapez deux fois le front avec le pouce de la main ouverte.",
        signEmoji: "👨",
      },
      {
        title: "Frère",
        description: "Pointez l'index vers le haut, puis vers le bas depuis le front.",
        signEmoji: "🧑",
      },
      {
        title: "Ami(e)",
        description: "Entrecroisez les index de chaque main deux fois.",
        signEmoji: "🤝",
        tip: "En Tunisie, le signe d'amitié est souvent accompagné d'un sourire chaleureux.",
      },
      {
        title: "Je t'aime",
        description: "Croisez les bras sur la poitrine, comme un câlin, avec une expression douce.",
        signEmoji: "❤️",
      },
    ],
  },
  {
    slug: "administrations",
    title: "Administrations",
    description: "Termes administratifs et juridiques en contexte local.",
    category: "admin",
    categoryIcon: "🏛️",
    lessonsCount: 4,
    steps: [
      {
        title: "Carte d'identité",
        description: "Mimez un rectangle avec les deux mains, puis pointez vers vous.",
        signEmoji: "🪪",
      },
      {
        title: "Signer / Signature",
        description: "Mimez le geste d'écrire avec un stylo sur la paume ouverte.",
        signEmoji: "✍️",
      },
      {
        title: "Rendez-vous",
        description: "Pointez un doigt vers votre poignet (montre), puis vers l'interlocuteur.",
        signEmoji: "📅",
      },
      {
        title: "Attendre",
        description: "Levez la main ouverte, paume vers l'avant, en maintenant la position.",
        signEmoji: "✋",
      },
    ],
  },
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}
