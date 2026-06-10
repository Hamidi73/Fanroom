// src/app/data/i18n.ts
//
// Homepage UI translations. The language selector in the header switches between
// these. To add a language: add it to `languages` and add a matching block to
// `translations`. To translate more of the page: add a key to `TranslationKey`
// and fill it in for every language (TypeScript will tell you which are missing).
//
// This is a lightweight, hand-maintained dictionary — not a full i18n framework.
// Swap it for one (e.g. next-intl) later without touching the components that
// consume `t`.

export const languages = ["English", "Arabic", "Spanish", "French", "Portuguese"] as const;

export type Language = (typeof languages)[number];

export type TranslationKey =
  | "navChooseNation"
  | "mainHeadline"
  | "heroSubtext"
  | "ctaChooseNation"
  | "ctaExploreStreamers"
  | "chooseNationHeading"
  | "fixturesHeading"
  | "topStreamersHeading"
  | "safetyHeading"
  | "safetyText";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  English: {
    navChooseNation: "Choose Nation",
    mainHeadline: "Find your nation and the best World Cup fan rooms.",
    heroSubtext: "Discover top national streamers and language-based rooms — all without match footage.",
    ctaChooseNation: "Choose your nation",
    ctaExploreStreamers: "Explore top streamers",
    chooseNationHeading: "Find your country’s top streamers and fan rooms.",
    fixturesHeading: "Browse the next fan-ready matches.",
    topStreamersHeading: "Follow the creators fans want to join.",
    safetyHeading: "No match footage. Only creator-led fan watch-alongs.",
    safetyText:
      "This platform is designed to keep every stream compliant and copyright-friendly. Streamers share reactions, commentary, and chat — not the match feed.",
  },
  Arabic: {
    navChooseNation: "اختر دولتك",
    mainHeadline: "اعثر على بلدك والغرف الجماهيرية الأفضل.",
    heroSubtext: "اكتشف أفضل المذيعين المحليين وغرف اللغة — دون لقطات المباريات.",
    ctaChooseNation: "اختر دولتك",
    ctaExploreStreamers: "استكشف أفضل المذيعين",
    chooseNationHeading: "ابحث عن أفضل المذيعين وغرف الجماهير في بلدك.",
    fixturesHeading: "تصفح المباريات القادمة.",
    topStreamersHeading: "تابع المذيعين الذين يتابعهم الجمهور.",
    safetyHeading: "لا بث لمقاطع المباريات. التفاعل فقط.",
    safetyText:
      "تم تصميم هذه المنصة لتكون متوافقة وتوفر محتوى آمنًا؛ يشارك المذيعون ردود الفعل والتعليقات والدردشة — وليس لقطات المباراة.",
  },
  Spanish: {
    navChooseNation: "Elige país",
    mainHeadline: "Encuentra tu país y las mejores salas de fans.",
    heroSubtext: "Descubre streamers locales y salas por idioma — sin imágenes de partido.",
    ctaChooseNation: "Elige tu país",
    ctaExploreStreamers: "Explorar streamers",
    chooseNationHeading: "Encuentra los mejores streamers y salas de tu país.",
    fixturesHeading: "Explora los próximos partidos.",
    topStreamersHeading: "Sigue a los creadores que atraen fans.",
    safetyHeading: "Sin imágenes de partido. Solo reacciones del creador.",
    safetyText:
      "La plataforma mantiene el cumplimiento de derechos: los creadores comparten reacciones, comentarios y chat — no el partido.",
  },
  French: {
    navChooseNation: "Choisir un pays",
    mainHeadline: "Trouvez votre pays et les meilleures salles de supporters.",
    heroSubtext: "Découvrez les meilleurs streamers nationaux et les salons par langue — sans images de match.",
    ctaChooseNation: "Choisir votre pays",
    ctaExploreStreamers: "Découvrir les streamers",
    chooseNationHeading: "Trouvez les meilleurs streamers et salles de votre pays.",
    fixturesHeading: "Parcourez les prochains matches.",
    topStreamersHeading: "Suivez les créateurs que les fans aiment.",
    safetyHeading: "Pas d’images de match. Réactions et commentaires seulement.",
    safetyText:
      "La plateforme garantit la conformité : les streamers partagent réactions, commentaires et chat — pas le flux du match.",
  },
  Portuguese: {
    navChooseNation: "Escolha seu país",
    mainHeadline: "Encontre seu país e as melhores salas de fãs.",
    heroSubtext: "Descubra streamers locais e salas por idioma — sem imagens da partida.",
    ctaChooseNation: "Escolha seu país",
    ctaExploreStreamers: "Explorar streamers",
    chooseNationHeading: "Encontre os melhores streamers e salas do seu país.",
    fixturesHeading: "Veja as próximas partidas.",
    topStreamersHeading: "Siga os criadores que os fãs acompanham.",
    safetyHeading: "Sem imagens da partida. Apenas reações dos criadores.",
    safetyText:
      "A plataforma mantém conformidade: os criadores compartilham reações, comentários e chat — não o feed do jogo.",
  },
};

/** Translations for one language, falling back to English for any missing key. */
export function getTranslations(language: Language): Record<TranslationKey, string> {
  return translations[language] ?? translations.English;
}
