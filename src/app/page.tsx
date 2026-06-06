"use client";

import { useState, ChangeEvent, FormEvent } from "react";

// ─── LANGUAGE (kept simple) ───────────────────────────────────────────────────
const languages = ["English", "Arabic", "Spanish", "French", "Portuguese"];

const translations: Record<string, Record<string, string>> = {
  English: {
    navChooseNation: "Choose Nation",
    navFixtures: "Fixtures",
    navTopStreamers: "Top Streamers",
    navApply: "Apply to Stream",
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
    streamerApplicationHeading: "Apply to join the World Cup creator stage.",
  },
  Arabic: {
    navChooseNation: "اختر دولتك",
    navFixtures: "المباريات",
    navTopStreamers: "أفضل المذيعين",
    navApply: "التقديم للبث",
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
    streamerApplicationHeading: "قدّم للانضمام إلى صانعي المحتوى.",
  },
  Spanish: {
    navChooseNation: "Elige país",
    navFixtures: "Partidos",
    navTopStreamers: "Top Streamers",
    navApply: "Solicitar transmisión",
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
    streamerApplicationHeading: "Solicita unirte como creador.",
  },
  French: {
    navChooseNation: "Choisir un pays",
    navFixtures: "Matches",
    navTopStreamers: "Top Streamers",
    navApply: "Postuler pour streamer",
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
    streamerApplicationHeading: "Postulez pour rejoindre la scène créative.",
  },
  Portuguese: {
    navChooseNation: "Escolha seu país",
    navFixtures: "Partidas",
    navTopStreamers: "Top Streamers",
    navApply: "Inscrever-se para transmitir",
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
    streamerApplicationHeading: "Candidate-se para entrar como criador.",
  },
};

const countryCards = [
  {
    flag: "🇨🇦",
    country: "Canada",
    languages: "English, French",
    topStreamers: "MapleMode, NorthGate",
    match: "Canada vs Mexico",
    rooms: 12,
    borderColor: "rgba(0,114,188,0.28)",
    accentColor: "rgba(255,255,255,0.08)",
  },
  {
    flag: "🇲🇽",
    country: "Mexico",
    languages: "Spanish, English",
    topStreamers: "AztecPulse, VerdeVibe",
    match: "Mexico vs Argentina",
    rooms: 13,
    borderColor: "rgba(0,152,69,0.32)",
    accentColor: "rgba(255,0,0,0.12)",
  },
  {
    flag: "🇺🇸",
    country: "USA",
    languages: "English, Spanish",
    topStreamers: "StarsAndStripes, FanZoneUS",
    match: "USA vs England",
    rooms: 16,
    borderColor: "rgba(3,82,156,0.32)",
    accentColor: "rgba(222,38,48,0.12)",
  },
  {
    flag: "🇩🇿",
    country: "Algeria",
    languages: "Arabic, French",
    topStreamers: "DesertRoar, AtlasBeam",
    match: "Algeria vs Egypt",
    rooms: 7,
    borderColor: "rgba(0,122,61,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇦🇷",
    country: "Argentina",
    languages: "Spanish, English",
    topStreamers: "LunaRoja, TangoFan",
    match: "Argentina vs Mexico",
    rooms: 10,
    borderColor: "rgba(116,179,242,0.32)",
    accentColor: "rgba(255,215,0,0.1)",
  },
  {
    flag: "🇦🇺",
    country: "Australia",
    languages: "English",
    topStreamers: "KoalaCast, DownUnderLive",
    match: "Australia vs France",
    rooms: 9,
    borderColor: "rgba(0,82,180,0.32)",
    accentColor: "rgba(255,206,0,0.12)",
  },
  {
    flag: "🇦🇹",
    country: "Austria",
    languages: "German, English",
    topStreamers: "AlpineWave, RedWhiteLive",
    match: "Austria vs Germany",
    rooms: 8,
    borderColor: "rgba(200,16,46,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇧🇪",
    country: "Belgium",
    languages: "Dutch, French, English",
    topStreamers: "RedDevilTV, BrusselsBeat",
    match: "Belgium vs Switzerland",
    rooms: 11,
    borderColor: "rgba(255,206,0,0.32)",
    accentColor: "rgba(0,0,0,0.12)",
  },
  {
    flag: "🇧🇦",
    country: "Bosnia and Herzegovina",
    languages: "Bosnian, English",
    topStreamers: "BalkanPulse, SarajevoSound",
    match: "Bosnia vs Croatia",
    rooms: 6,
    borderColor: "rgba(0,84,166,0.32)",
    accentColor: "rgba(255,255,204,0.08)",
  },
  {
    flag: "🇧🇷",
    country: "Brazil",
    languages: "Portuguese, English",
    topStreamers: "RafaGoals, SambaBeat",
    match: "Brazil vs Japan",
    rooms: 18,
    borderColor: "rgba(16,185,129,0.32)",
    accentColor: "rgba(253,224,71,0.14)",
  },
  {
    flag: "🇨🇻",
    country: "Cabo Verde",
    languages: "Portuguese, Creole",
    topStreamers: "CaboWaves, IslandEcho",
    match: "Cabo Verde vs Ghana",
    rooms: 5,
    borderColor: "rgba(0,135,155,0.32)",
    accentColor: "rgba(255,204,0,0.12)",
  },
  {
    flag: "🇨🇴",
    country: "Colombia",
    languages: "Spanish, English",
    topStreamers: "CoffeeCast, AndesRoar",
    match: "Colombia vs Uruguay",
    rooms: 10,
    borderColor: "rgba(255,209,0,0.32)",
    accentColor: "rgba(220,20,60,0.1)",
  },
  {
    flag: "🇨🇩",
    country: "Congo DR",
    languages: "French, Lingala",
    topStreamers: "KinshasaLive, RiverBeat",
    match: "Congo DR vs Algeria",
    rooms: 7,
    borderColor: "rgba(0,54,158,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇨🇮",
    country: "Côte d'Ivoire",
    languages: "French, English",
    topStreamers: "IvoryPulse, AbidjanAir",
    match: "Côte d'Ivoire vs Nigeria",
    rooms: 8,
    borderColor: "rgba(255,153,0,0.32)",
    accentColor: "rgba(0,0,0,0.1)",
  },
  {
    flag: "🇭🇷",
    country: "Croatia",
    languages: "Croatian, English",
    topStreamers: "DalmatianDrive, CheckeredCast",
    match: "Croatia vs England",
    rooms: 9,
    borderColor: "rgba(255,255,255,0.28)",
    accentColor: "rgba(200,16,46,0.12)",
  },
  {
    flag: "🇨🇼",
    country: "Curaçao",
    languages: "Dutch, Papiamentu",
    topStreamers: "CuraçaoVibe, CaribbeanCast",
    match: "Curaçao vs France",
    rooms: 4,
    borderColor: "rgba(0,104,183,0.32)",
    accentColor: "rgba(255,204,0,0.1)",
  },
  {
    flag: "🇨🇿",
    country: "Czechia",
    languages: "Czech, English",
    topStreamers: "PraguePulse, BohemianBuzz",
    match: "Czechia vs Croatia",
    rooms: 7,
    borderColor: "rgba(0,33,165,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇪🇨",
    country: "Ecuador",
    languages: "Spanish, English",
    topStreamers: "AndesLive, QuitoQuest",
    match: "Ecuador vs Argentina",
    rooms: 9,
    borderColor: "rgba(255,209,0,0.32)",
    accentColor: "rgba(0,91,187,0.12)",
  },
  {
    flag: "🇪🇬",
    country: "Egypt",
    languages: "Arabic, English",
    topStreamers: "CairoCore, NileNight",
    match: "Egypt vs Algeria",
    rooms: 8,
    borderColor: "rgba(0,122,61,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇬🇧",
    country: "England",
    languages: "English",
    topStreamers: "StadiumVibes, LionHeart",
    match: "England vs USA",
    rooms: 14,
    borderColor: "rgba(255,255,255,0.28)",
    accentColor: "rgba(206,17,38,0.12)",
  },
  {
    flag: "🇫🇷",
    country: "France",
    languages: "French, English",
    topStreamers: "ParisPulse, BleuRoar",
    match: "France vs Germany",
    rooms: 11,
    borderColor: "rgba(0,85,164,0.32)",
    accentColor: "rgba(237,41,57,0.12)",
  },
  {
    flag: "🇩🇪",
    country: "Germany",
    languages: "German, English",
    topStreamers: "BerlinBounce, DieMannschaft",
    match: "Germany vs France",
    rooms: 13,
    borderColor: "rgba(0,0,0,0.32)",
    accentColor: "rgba(221,0,0,0.1)",
  },
  {
    flag: "🇬🇭",
    country: "Ghana",
    languages: "English",
    topStreamers: "BlackStarBeat, AccraWave",
    match: "Ghana vs Tunisia",
    rooms: 8,
    borderColor: "rgba(0,0,0,0.32)",
    accentColor: "rgba(255,153,0,0.12)",
  },
  {
    flag: "🇭🇹",
    country: "Haiti",
    languages: "French, Creole",
    topStreamers: "PortAuPrincePulse, CreoleCast",
    match: "Haiti vs Honduras",
    rooms: 5,
    borderColor: "rgba(0,32,91,0.32)",
    accentColor: "rgba(206,17,38,0.1)",
  },
  {
    flag: "🇮🇷",
    country: "IR Iran",
    languages: "Persian, English",
    topStreamers: "TehranTides, PersianPulse",
    match: "IR Iran vs USA",
    rooms: 6,
    borderColor: "rgba(0,122,61,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇮🇶",
    country: "Iraq",
    languages: "Arabic, Kurdish",
    topStreamers: "BaghdadBeat, TigrisTalk",
    match: "Iraq vs Saudi Arabia",
    rooms: 5,
    borderColor: "rgba(0,122,61,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇯🇵",
    country: "Japan",
    languages: "Japanese, English",
    topStreamers: "SakuraStream, TokyoTactics",
    match: "Japan vs South Korea",
    rooms: 7,
    borderColor: "rgba(255,255,255,0.28)",
    accentColor: "rgba(206,17,38,0.12)",
  },
  {
    flag: "🇯🇴",
    country: "Jordan",
    languages: "Arabic, English",
    topStreamers: "AmmanArena, PetraPulse",
    match: "Jordan vs Qatar",
    rooms: 6,
    borderColor: "rgba(206,17,38,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇰🇷",
    country: "Korea Republic",
    languages: "Korean, English",
    topStreamers: "KWaveFan, SeoulShout",
    match: "Korea Republic vs Japan",
    rooms: 10,
    borderColor: "rgba(255,255,255,0.28)",
    accentColor: "rgba(0,57,166,0.12)",
  },
  {
    flag: "🇲🇦",
    country: "Morocco",
    languages: "Arabic, French",
    topStreamers: "RashidLive, AtlasWave",
    match: "Morocco vs Spain",
    rooms: 8,
    borderColor: "rgba(165,42,42,0.32)",
    accentColor: "rgba(16,185,129,0.12)",
  },
  {
    flag: "🇳🇱",
    country: "Netherlands",
    languages: "Dutch, English",
    topStreamers: "OrangeWave, CanalCast",
    match: "Netherlands vs Germany",
    rooms: 12,
    borderColor: "rgba(255,102,0,0.32)",
    accentColor: "rgba(33,37,159,0.1)",
  },
  {
    flag: "🇳🇿",
    country: "New Zealand",
    languages: "English, Māori",
    topStreamers: "KiwiKick, BlackFernsLive",
    match: "New Zealand vs Australia",
    rooms: 7,
    borderColor: "rgba(0,0,0,0.32)",
    accentColor: "rgba(255,255,255,0.08)",
  },
  {
    flag: "🇳🇴",
    country: "Norway",
    languages: "Norwegian, English",
    topStreamers: "FjordFire, NordicNoise",
    match: "Norway vs Sweden",
    rooms: 8,
    borderColor: "rgba(204,51,51,0.32)",
    accentColor: "rgba(0,32,91,0.12)",
  },
  {
    flag: "🇵🇦",
    country: "Panama",
    languages: "Spanish, English",
    topStreamers: "CanalCast, PanamericanaPulse",
    match: "Panama vs Costa Rica",
    rooms: 6,
    borderColor: "rgba(0,122,61,0.32)",
    accentColor: "rgba(255,0,0,0.1)",
  },
  {
    flag: "🇵🇾",
    country: "Paraguay",
    languages: "Spanish, Guarani",
    topStreamers: "GuaraniGlow, AsuncionAir",
    match: "Paraguay vs Brazil",
    rooms: 6,
    borderColor: "rgba(255,0,0,0.32)",
    accentColor: "rgba(255,255,0,0.1)",
  },
  {
    flag: "🇵🇹",
    country: "Portugal",
    languages: "Portuguese, English",
    topStreamers: "FadoFire, AzoresArena",
    match: "Portugal vs Spain",
    rooms: 10,
    borderColor: "rgba(155,0,0,0.32)",
    accentColor: "rgba(0,122,61,0.14)",
  },
  {
    flag: "🇶🇦",
    country: "Qatar",
    languages: "Arabic, English",
    topStreamers: "DohaDrive, PearlPulse",
    match: "Qatar vs France",
    rooms: 6,
    borderColor: "rgba(140,39,31,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇸🇦",
    country: "Saudi Arabia",
    languages: "Arabic, English",
    topStreamers: "DesertDrums, RiyadhRush",
    match: "Saudi Arabia vs Poland",
    rooms: 6,
    borderColor: "rgba(0,122,61,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    country: "Scotland",
    languages: "English, Scots",
    topStreamers: "TartanTide, HighlandHype",
    match: "Scotland vs England",
    rooms: 9,
    borderColor: "rgba(0,0,0,0.32)",
    accentColor: "rgba(255,0,0,0.12)",
  },
  {
    flag: "🇸🇳",
    country: "Senegal",
    languages: "French, Wolof",
    topStreamers: "LionOfTeranga, DakarDrive",
    match: "Senegal vs Tunisia",
    rooms: 7,
    borderColor: "rgba(0,122,61,0.32)",
    accentColor: "rgba(255,215,0,0.1)",
  },
  {
    flag: "🇿🇦",
    country: "South Africa",
    languages: "English, Afrikaans",
    topStreamers: "RainbowRoar, CapeCityCast",
    match: "South Africa vs Ghana",
    rooms: 8,
    borderColor: "rgba(0,0,0,0.32)",
    accentColor: "rgba(255,255,0,0.1)",
  },
  {
    flag: "🇪🇸",
    country: "Spain",
    languages: "Spanish, English",
    topStreamers: "OléWatch, RojaRally",
    match: "Spain vs Portugal",
    rooms: 9,
    borderColor: "rgba(206,17,38,0.32)",
    accentColor: "rgba(255,205,0,0.1)",
  },
  {
    flag: "🇸🇪",
    country: "Sweden",
    languages: "Swedish, English",
    topStreamers: "NordicNoise, StockholmStream",
    match: "Sweden vs Norway",
    rooms: 8,
    borderColor: "rgba(0,106,167,0.32)",
    accentColor: "rgba(254,204,0,0.1)",
  },
  {
    flag: "🇨🇭",
    country: "Switzerland",
    languages: "German, French, Italian",
    topStreamers: "AlpineAir, SwissSignal",
    match: "Switzerland vs Belgium",
    rooms: 7,
    borderColor: "rgba(255,255,255,0.32)",
    accentColor: "rgba(206,17,38,0.1)",
  },
  {
    flag: "🇹🇳",
    country: "Tunisia",
    languages: "Arabic, French",
    topStreamers: "CarthageCast, TunisTonic",
    match: "Tunisia vs Senegal",
    rooms: 6,
    borderColor: "rgba(206,17,38,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇹🇷",
    country: "Türkiye",
    languages: "Turkish, English",
    topStreamers: "AnkaraArena, BosphorusBeat",
    match: "Türkiye vs Portugal",
    rooms: 10,
    borderColor: "rgba(206,17,38,0.32)",
    accentColor: "rgba(0,122,61,0.12)",
  },
  {
    flag: "🇺🇾",
    country: "Uruguay",
    languages: "Spanish, English",
    topStreamers: "CelesteCast, MontevideoMode",
    match: "Uruguay vs Brazil",
    rooms: 8,
    borderColor: "rgba(0,68,147,0.32)",
    accentColor: "rgba(255,255,255,0.1)",
  },
  {
    flag: "🇺🇿",
    country: "Uzbekistan",
    languages: "Uzbek, Russian",
    topStreamers: "TashkentTide, SilkRoadStream",
    match: "Uzbekistan vs Japan",
    rooms: 5,
    borderColor: "rgba(0,102,102,0.32)",
    accentColor: "rgba(255,255,255,0.08)",
  },
];


// ─── HERO DEMO DATA (visual until backend/video exist) ────────────────────────
// Featured stream + fixtures rail. "Watch" links point to REAL room IDs so the
// click-through works today. Viewer counts and "live" are placeholders.

const featured = {
  match: "Morocco vs Spain",
  flags: "🇲🇦🇪🇸",
  host: "RashidLive",
  hostInitials: "RL",
  lang: "🇲🇦 Arabic",
  viewers: "4,812",
  roomId: "casablanca-watch-party",
  gradient: "linear-gradient(135deg,#c1272d 0%,#006233 100%)",
};

const subStreams = [
  { title: "Samba Rush", initials: "RG", sub: "🇧🇷 Brazil", viewers: "4.8K", roomId: "brazil-japan-room", dot: "#ffdf00", dotText: "#000", grad: "linear-gradient(135deg,#009b3a,#ffdf00)" },
  { title: "Three Lions", initials: "LL", sub: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", viewers: "1.1K", roomId: "england-usa-live", dot: "#c8102e", dotText: "#fff", grad: "linear-gradient(135deg,#012169,#c8102e)" },
  { title: "Bleu Stadium", initials: "EB", sub: "🇫🇷 France", viewers: "980", roomId: "france-germany-room", dot: "#0055a4", dotText: "#fff", grad: "linear-gradient(135deg,#0055a4,#ef4135)" },
  { title: "Sakura Patrol", initials: "SS", sub: "🇯🇵 Japan", viewers: "850", roomId: "brazil-japan-room", dot: "#bc002d", dotText: "#fff", grad: "linear-gradient(135deg,#bc002d,#1d1d1d)" },
];

type FixtureStreamer = { name: string; meta: string; initials: string; dot: string; dotText: string; roomId: string };
type TodayFixture = { teams: string; flags: string; time: string; streamers: FixtureStreamer[] };

const todayFixtures: TodayFixture[] = [
  {
    teams: "Morocco v Spain", flags: "🇲🇦 🇪🇸", time: "7:00 PM · 5 rooms live",
    streamers: [
      { name: "RashidLive", meta: "4.8K · Arabic", initials: "RL", dot: "#fcd116", dotText: "#000", roomId: "casablanca-watch-party" },
      { name: "AtlasWave", meta: "2.1K · French", initials: "AW", dot: "#c1272d", dotText: "#fff", roomId: "morocco-spain-room" },
      { name: "OléWatch", meta: "1.4K · Spanish", initials: "OW", dot: "#aa151b", dotText: "#fff", roomId: "morocco-spain-room" },
    ],
  },
  {
    teams: "Brazil v Japan", flags: "🇧🇷 🇯🇵", time: "10:30 PM · 3 rooms live",
    streamers: [
      { name: "RafaGoals", meta: "1.2K · Portuguese", initials: "RG", dot: "#ffdf00", dotText: "#000", roomId: "brazil-japan-room" },
      { name: "SakuraStream", meta: "850 · Japanese", initials: "SS", dot: "#bc002d", dotText: "#fff", roomId: "brazil-japan-room" },
    ],
  },
  {
    teams: "England v USA", flags: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇺🇸", time: "6:30 PM · 4 rooms live",
    streamers: [
      { name: "LondonLoud", meta: "1.1K · English", initials: "LL", dot: "#012169", dotText: "#fff", roomId: "england-usa-live" },
      { name: "FanZoneUS", meta: "760 · English", initials: "FZ", dot: "#b22234", dotText: "#fff", roomId: "rivalry-room" },
    ],
  },
  {
    teams: "France v Germany", flags: "🇫🇷 🇩🇪", time: "8:00 PM · 4 rooms live",
    streamers: [
      { name: "ParisPulse", meta: "1.0K · French", initials: "PP", dot: "#0055a4", dotText: "#fff", roomId: "france-germany-room" },
      { name: "BerlinBounce", meta: "870 · German", initials: "BB", dot: "#000", dotText: "#fff", roomId: "france-germany-room" },
    ],
  },
];

function nationSlug(country: string) {
  return country.toLowerCase().replace(/\s+/g, "-");
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [openFixture, setOpenFixture] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: "", email: "", country: "", team: "", language: "", social: "", entertainment: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const t = translations[selectedLanguage];

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const application = { ...formData, createdAt: new Date().toISOString() };
    const stored = localStorage.getItem("streamerApplications");
    const parsed = stored ? JSON.parse(stored) : [];
    const apps = Array.isArray(parsed) ? parsed : [];
    localStorage.setItem("streamerApplications", JSON.stringify([...apps, application]));
    setSubmitted(true);
  };

  return (
    <main style={{ fontFamily: "'Outfit', sans-serif", background: "#0a0a0f", color: "#f4f4f6", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@400;500;600;700;800&display=swap');
        .fr-display { font-family:'Anton',sans-serif; text-transform:uppercase; letter-spacing:0.01em; }
        @keyframes fr-pulse { 0%,100%{opacity:1;} 50%{opacity:.3;} }
        .fr-dot { width:7px; height:7px; border-radius:50%; background:#ff3b3b; animation:fr-pulse 1.4s infinite; display:inline-block; }
        .fr-hero { display:grid; grid-template-columns:7fr 3fr; gap:16px; align-items:start; }
        .fr-subgrid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:10px; }
        .fr-nationgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }
        .fr-card-hover { transition:transform .18s, border-color .18s; }
        .fr-card-hover:hover { transform:translateY(-3px); border-color:#ffd23f; }
        .fr-feature:hover { transform:translateY(-3px); }
        .fr-nation:hover { transform:translateY(-4px); }
        @media (max-width:940px){ .fr-hero { grid-template-columns:1fr; } }
        @media (max-width:680px){ .fr-subgrid { grid-template-columns:repeat(2,1fr); } }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="fr-display" style={{ fontSize: 22 }}>FANROOM<span style={{ color: "#ffd23f" }}>GLOBAL</span></div>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          <a href="#nations" style={{ color: "#9a9aa8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navChooseNation}</a>
          <a href="#apply" style={{ color: "#9a9aa8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navApply}</a>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "6px 12px", fontSize: 13, fontFamily: "inherit", outline: "none" }}
          >
            {languages.map((l) => <option key={l} value={l} style={{ background: "#0a0a0f" }}>{l}</option>)}
          </select>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: 22 }}>

        {/* preview note */}
        <div style={{ background: "rgba(255,210,63,0.1)", border: "1px solid rgba(255,210,63,0.3)", color: "#ffd23f", fontSize: 12, padding: "8px 14px", borderRadius: 8, textAlign: "center", marginBottom: 18 }}>
          ⚡ Preview — live rooms & video are coming. Reactions, commentary & community only — never match footage.
        </div>

        {/* ── HERO: 70% featured + sub-streams | 30% fixtures ── */}
        <div className="fr-hero">

          {/* LEFT 70% */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Featured */}
            <a href={`/room/${featured.roomId}`} className="fr-feature" style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", cursor: "pointer", background: featured.gradient, display: "flex", flexDirection: "column", justifyContent: "flex-end", textDecoration: "none", color: "#fff", transition: "transform .25s" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 30%,rgba(255,255,255,0.18),transparent 40%),linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.1) 55%)" }} />
              <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", zIndex: 2 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.5)", padding: "5px 10px", borderRadius: 99, fontSize: 12 }}>👀 {featured.viewers} watching</span>
                <span style={{ fontSize: 40, letterSpacing: 5 }}>{featured.flags}</span>
              </div>
              <div style={{ position: "relative", zIndex: 2, padding: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ffd23f", letterSpacing: "0.12em", textTransform: "uppercase" }}>● Biggest room right now</div>
                <div className="fr-display" style={{ fontSize: "clamp(26px,3vw,38px)", lineHeight: 0.95, margin: "7px 0 6px" }}>{featured.match}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#e8e8ee", fontSize: 13, fontWeight: 500, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 25, height: 25, borderRadius: "50%", background: "#ffd23f", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11 }}>{featured.hostInitials}</span>
                    {featured.host}
                  </span>
                  <span>· {featured.lang}</span>
                </div>
                <span style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#000", padding: "12px 24px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>▶ Watch now</span>
              </div>
            </a>

            {/* Sub-streams under featured */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#9a9aa8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <span className="fr-dot" /> Also live right now
              </div>
              <div className="fr-subgrid">
                {subStreams.map((s) => (
                  <a key={s.title + s.sub} href={`/room/${s.roomId}`} className="fr-card-hover" style={{ borderRadius: 12, overflow: "hidden", background: "#16161f", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none", color: "#f4f4f6", display: "block" }}>
                    <div style={{ position: "relative", aspectRatio: "16/9", background: s.grad }}>
                      <span style={{ position: "absolute", top: 7, left: 7, background: "#ff3b3b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>LIVE</span>
                      <span style={{ position: "absolute", bottom: 7, right: 7, background: "rgba(0,0,0,0.6)", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>{s.viewers}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, padding: 9, alignItems: "center" }}>
                      <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, background: s.dot, color: s.dotText }}>{s.initials}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.2 }}>{s.title}</div>
                        <div style={{ fontSize: 10.5, color: "#9a9aa8", marginTop: 2 }}>{s.sub}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 30%: fixtures with dropdowns */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#9a9aa8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Today&apos;s fixtures</div>
            {todayFixtures.map((fx, i) => {
              const open = openFixture === i;
              return (
                <div key={fx.teams} style={{ background: "#16161f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
                  <div onClick={() => setOpenFixture(open ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 15px", cursor: "pointer" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 600, fontSize: 14 }}><span style={{ fontSize: 18 }}>{fx.flags}</span> {fx.teams}</div>
                      <div style={{ fontSize: 11, color: "#9a9aa8", marginTop: 2 }}>{fx.time}</div>
                    </div>
                    <span style={{ color: "#9a9aa8", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
                  </div>
                  {open && (
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9a9aa8", padding: "9px 15px 4px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>Top streamers for this game</div>
                      {fx.streamers.map((st, idx) => (
                        <a key={st.name} href={`/room/${st.roomId}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 15px", textDecoration: "none", color: "#f4f4f6" }}>
                          <span className="fr-display" style={{ fontSize: 14, color: "#ffd23f", width: 14 }}>{idx + 1}</span>
                          <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, background: st.dot, color: st.dotText }}>{st.initials}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, display: "block" }}>{st.name}</span>
                            <span style={{ fontSize: 11, color: "#9a9aa8" }}>{st.meta}</span>
                          </span>
                          <span style={{ fontSize: 12, color: "#ffd23f", fontWeight: 600 }}>Watch</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── NATIONS ── */}
        <div id="nations" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "38px 0 16px" }}>
          <h2 className="fr-display" style={{ fontSize: 24 }}>🌍 Pick your nation</h2>
        </div>
        <div className="fr-nationgrid">
          {countryCards.map((c) => (
            <a key={c.country} href={`/nation/${nationSlug(c.country)}`} className="fr-nation" style={{ position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer", aspectRatio: "4/3", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14, textDecoration: "none", color: "#fff", transition: "transform .2s", backgroundImage: `radial-gradient(circle at top left, ${c.accentColor}, transparent 35%), linear-gradient(160deg, ${c.borderColor}, #0c0c14 80%)` }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.78),transparent 65%)" }} />
              <span style={{ position: "absolute", top: 12, left: 14, fontSize: 30, zIndex: 2, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>{c.flag}</span>
              <span className="fr-display" style={{ position: "relative", zIndex: 2, fontSize: 18 }}>{c.country}</span>
              <span style={{ position: "relative", zIndex: 2, fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{c.rooms} fan rooms</span>
            </a>
          ))}
        </div>

        {/* ── APPLY ── */}
        <div id="apply" style={{ marginTop: 48 }}>
          <div style={{ borderRadius: 18, border: "1px solid rgba(255,210,63,0.15)", background: "linear-gradient(160deg,#12121c,#0c0c14)", padding: 28 }}>
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1.1fr", alignItems: "start" }}>
              <div>
                <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em", color: "#ffd23f" }}>Become a host</p>
                <h2 className="fr-display" style={{ fontSize: 30, marginTop: 8 }}>{t.streamerApplicationHeading}</h2>
                <p style={{ marginTop: 12, color: "#9a9aa8", fontSize: 14, lineHeight: 1.6 }}>Represent your nation. Host the room. Bring the energy. (Applications save locally for now.)</p>
              </div>
              <div style={{ background: "#0c0c14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 22 }}>
                {submitted ? (
                  <div style={{ textAlign: "center", padding: 16 }}>
                    <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em", color: "#34d399" }}>Application received</p>
                    <h3 className="fr-display" style={{ fontSize: 22, marginTop: 10 }}>Thanks for applying!</h3>
                    <p style={{ marginTop: 8, color: "#9a9aa8", fontSize: 13 }}>We&apos;ll reach out as we build the platform.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {([["name","Name","text"],["email","Email","email"],["country","Country","text"],["team","Team supported","text"],["language","Main language","text"],["social","Social link","text"]] as const).map(([k,label,type]) => (
                      <label key={k} style={{ fontSize: 13, color: "#9a9aa8" }}>
                        <span style={{ color: "#fff" }}>{label}</span>
                        <input name={k} type={type} value={(formData as Record<string,string>)[k]} onChange={handleChange} required={k !== "social"}
                          style={{ marginTop: 6, width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#07070d", padding: "10px 14px", color: "#fff", outline: "none", fontFamily: "inherit", fontSize: 14 }} />
                      </label>
                    ))}
                    <label style={{ fontSize: 13, color: "#9a9aa8" }}>
                      <span style={{ color: "#fff" }}>Why would your room be entertaining?</span>
                      <textarea name="entertainment" value={formData.entertainment} onChange={handleChange} required rows={3}
                        style={{ marginTop: 6, width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#07070d", padding: "10px 14px", color: "#fff", outline: "none", fontFamily: "inherit", fontSize: 14, resize: "vertical" }} />
                    </label>
                    <button type="submit" style={{ width: "100%", borderRadius: 99, background: "#ffd23f", color: "#000", border: "none", padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Submit application</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <footer style={{ textAlign: "center", color: "#9a9aa8", fontSize: 12, padding: "40px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 40 }}>
        Reminder: rooms are for reactions, commentary &amp; community — never match footage. · FanRoom Global
      </footer>
    </main>
  );
}
