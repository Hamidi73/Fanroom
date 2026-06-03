"use client";

import { useState, ChangeEvent, FormEvent } from "react";

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

const upcomingFixtures = [
  {
    teams: "France vs Germany",
    date: "Sun 24 Nov · 8:00 PM GMT",
    rooms: 12,
    tag: "Group D",
  },
  {
    teams: "Brazil vs Japan",
    date: "Tue 26 Nov · 10:30 PM GMT",
    rooms: 18,
    tag: "Group E",
  },
  {
    teams: "Morocco vs Spain",
    date: "Wed 27 Nov · 7:00 PM GMT",
    rooms: 9,
    tag: "Group B",
  },
  {
    teams: "England vs USA",
    date: "Fri 29 Nov · 6:30 PM GMT",
    rooms: 15,
    tag: "Group C",
  },
];

const countryCards = [
  {
    flag: "�🇦",
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
    flag: "�🇧",
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

const topStreamers = [
  {
    name: "Mira Fennec",
    country: "Morocco",
    language: "Arabic",
    style: "Passionate reaction host",
    viewers: "3.2K",
  },
  {
    name: "RafaGoals",
    country: "Brazil",
    language: "Portuguese",
    style: "High-energy fan commentary",
    viewers: "4.1K",
  },
  {
    name: "Nico Roja",
    country: "Argentina",
    language: "Spanish",
    style: "Tactical breakdown voice",
    viewers: "2.8K",
  },
  {
    name: "LondonLoud",
    country: "England",
    language: "English",
    style: "Rivalry chant leader",
    viewers: "3.5K",
  },
  {
    name: "Elsa Bleu",
    country: "France",
    language: "French",
    style: "Stylish live watch party",
    viewers: "2.6K",
  },
  {
    name: "Mateo Goal",
    country: "Spain",
    language: "Spanish",
    style: "Club culture storyteller",
    viewers: "2.9K",
  },
];

const trendingRooms = [
  {
    match: "Brazil vs Japan",
    host: "RafaGoals",
    language: "Portuguese",
    country: "Brazil",
    status: "Live",
    viewers: "4.8K",
  },
  {
    match: "England vs USA",
    host: "LondonLoud",
    language: "English",
    country: "England",
    status: "Scheduled",
    viewers: "2.4K",
  },
  {
    match: "Morocco vs Spain",
    host: "Mira Fennec",
    language: "Arabic",
    country: "Morocco",
    status: "Live",
    viewers: "3.9K",
  },
  {
    match: "France vs Germany",
    host: "Elsa Bleu",
    language: "French",
    country: "France",
    status: "Scheduled",
    viewers: "2.2K",
  },
];

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    team: "",
    language: "",
    social: "",
    entertainment: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const application = {
      ...formData,
      createdAt: new Date().toISOString(),
    };
    const stored = localStorage.getItem("streamerApplications");
    const parsed = stored ? JSON.parse(stored) : [];
    const apps = Array.isArray(parsed) ? parsed : [];
    const nextApplications = [...apps, application];
    localStorage.setItem("streamerApplications", JSON.stringify(nextApplications));
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.18),transparent_28%),radial-gradient(circle_at_center,rgba(234,179,8,0.08),transparent_38%)]" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-900/90 via-slate-950/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <header className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300 md:text-sm">FanRoom</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl lg:text-6xl">
                Find your nation, language, and the best World Cup fan rooms.
              </h1>
            </div>
            <div className="flex items-center justify-between w-full gap-4 md:w-auto md:justify-end">
              <div className="hidden md:flex md:items-center md:gap-4">
                <nav className="flex items-center gap-4 text-sm text-white/70">
                  <a href="#choose-nation" className="transition hover:text-white">{translations[selectedLanguage].navChooseNation}</a>
                  <a href="#fixtures" className="transition hover:text-white">{translations[selectedLanguage].navFixtures}</a>
                  <a href="#top-streamers" className="transition hover:text-white">{translations[selectedLanguage].navTopStreamers}</a>
                  <a href="#apply" className="transition hover:text-white">{translations[selectedLanguage].navApply}</a>
                </nav>
                <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  <span className="text-white/60 hidden md:inline">Language</span>
                  <select
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                    className="bg-transparent text-white outline-none"
                  >
                    {languages.map((language) => (
                      <option key={language} value={language} className="bg-[#040406] text-white">
                        {language}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex md:hidden items-center gap-3">
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
                  <select
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                    className="bg-transparent text-white outline-none text-sm"
                    aria-label="Language selector"
                  >
                    {languages.map((language) => (
                      <option key={language} value={language} className="bg-[#040406] text-white">
                        {language}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/3 p-2 text-white/90"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 rounded-lg border border-white/6 bg-[#021014] p-4">
              <nav className="flex flex-col gap-3">
                <a href="#choose-nation" className="block rounded px-3 py-2 text-base text-white/90">{translations[selectedLanguage].navChooseNation}</a>
                <a href="#fixtures" className="block rounded px-3 py-2 text-base text-white/90">{translations[selectedLanguage].navFixtures}</a>
                <a href="#top-streamers" className="block rounded px-3 py-2 text-base text-white/90">{translations[selectedLanguage].navTopStreamers}</a>
                <a href="#apply" className="block rounded px-3 py-2 text-base text-white/90">{translations[selectedLanguage].navApply}</a>
              </nav>
            </div>
          )}

          <section className="py-16">
            <div className="space-y-8">
              <div className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-sm shadow-emerald-500/10">
                Safe watch-alongs — no match footage, all creator-led energy.
              </div>

              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.35em] text-white/60">Fan-first World Cup discovery</p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  {translations[selectedLanguage].mainHeadline}
                </h2>
                <p className="max-w-2xl text-base md:text-lg leading-7 text-white/70">
                  {translations[selectedLanguage].heroSubtext}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-[#06111b] px-5 py-4 text-sm text-white/80">
                  {translations[selectedLanguage].safetyHeading}
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <a href="#choose-nation" className="block w-full rounded-full bg-emerald-400 px-6 py-4 text-base font-semibold text-black text-center transition duration-200 ease-out hover:bg-emerald-300 hover:shadow-[0_18px_30px_-22px_rgba(16,185,129,0.9)] sm:inline sm:w-auto">
                    {translations[selectedLanguage].ctaChooseNation}
                  </a>
                  <a href="#top-streamers" className="block w-full rounded-full border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white text-center transition duration-200 ease-out hover:bg-white/15 hover:border-emerald-300 sm:inline sm:w-auto">
                    {translations[selectedLanguage].ctaExploreStreamers}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Removed large language discovery section to keep homepage nation-first and clean */}

      <section id="choose-nation" className="bg-[#050507] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">{translations[selectedLanguage].navChooseNation}</p>
              <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">{translations[selectedLanguage].chooseNationHeading}</h2>
            </div>
            <p className="max-w-xl text-sm text-white/70">Country cards help fans jump directly to national streams and local match energy.</p>
          </div>

          <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {countryCards.map((country) => (
              <div
                key={country.country}
                className="rounded-[2rem] border p-5 shadow-sm shadow-black/25 transition hover:-translate-y-1"
                style={{
                  borderColor: country.borderColor,
                  backgroundImage: `radial-gradient(circle at top left, ${country.accentColor}, transparent 30%), radial-gradient(circle at bottom right, rgba(255,255,255,0.04), transparent 45%), linear-gradient(180deg, #071117 0%, #08131d 100%)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-3xl text-3xl shadow-inner shadow-black/30"
                    style={{ backgroundColor: country.borderColor }}
                  >
                    {country.flag}
                  </div>
                  <div>
                    <p className="text-base uppercase tracking-[0.35em] text-slate-300">{country.country}</p>
                    <p className="mt-1 text-xl font-bold text-white">{country.country}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3 text-base sm:text-sm text-white/70">
                  <p><span className="font-semibold text-white">Main languages:</span> {country.languages}</p>
                  <p><span className="font-semibold text-white">Top streamers:</span> {country.topStreamers}</p>
                  <p><span className="font-semibold text-white">Upcoming match:</span> {country.match}</p>
                </div>
                <div className="mt-6 flex flex-col items-stretch gap-3 rounded-[1.5rem] bg-white/5 px-4 py-4 text-base text-white/70 sm:flex-row sm:items-center sm:justify-between">
                  <span>{country.rooms} fan rooms</span>
                  <a href={`/nation/${country.country.toLowerCase().replace(/\s+/g, "-")}`} className="block w-full text-center text-emerald-300 sm:inline sm:w-auto">View nation rooms</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="global-trending" className="bg-[#050507] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Global Trending Fan Rooms</p>
              <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">Join the most active watch-along rooms.</h2>
            </div>
            <p className="max-w-xl text-sm text-white/70">Trending rooms surface the best matches, hosts, and language-based fan energy.</p>
          </div>

          <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {trendingRooms.map((room) => {
              const roomId = `${room.host.toLowerCase().replace(/\s+/g, "-")}-room`;
              return (
                <div key={`${room.match}-${room.host}`} className="rounded-[2rem] border border-white/10 bg-[#08121d] p-5 shadow-sm shadow-black/20 transition hover:-translate-y-1 hover:border-emerald-400/30">
                  <div className="flex items-center justify-between text-base sm:text-sm text-white/60">
                    <span className="font-semibold text-white">{room.match}</span>
                    <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.25em] ${room.status === "Live" ? "bg-red-500/15 text-red-300 ring-1 ring-red-500/10" : "bg-slate-700/70 text-slate-200"}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">Host: {room.host}</p>
                  <p className="mt-2 text-base sm:text-sm text-white/70">{room.language} • {room.country} fanbase</p>
                  <div className="mt-6 flex flex-col items-stretch gap-3 text-base text-white/70 sm:flex-row sm:items-center sm:justify-between">
                    <span>{room.viewers} viewers</span>
                    <a href={`/room/${roomId}`} className="block w-full text-center text-emerald-300 sm:inline sm:w-auto">Join room</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="top-streamers" className="bg-[#040406] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Top Streamers by Nation</p>
              <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">Follow the creators fans want to join.</h2>
            </div>
            <p className="max-w-xl text-sm text-white/70">Streamers are listed with their country, language, and personality so fans can find the right room quickly.</p>
          </div>

          <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {topStreamers.map((streamer) => (
              <div key={streamer.name} className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_30%),#08121d] p-5 ring-1 ring-slate-800/30 shadow-sm shadow-black/25 transition hover:-translate-y-1 hover:border-emerald-400/30">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">{streamer.country}</span>
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">{streamer.language}</span>
                </div>
                <h3 className="mt-4 text-xl sm:text-2xl font-bold text-white">{streamer.name}</h3>
                <p className="mt-3 text-base sm:text-sm text-white/70">{streamer.style}</p>
                <div className="mt-6 flex flex-col items-stretch gap-3 text-base text-white/70 sm:flex-row sm:items-center sm:justify-between">
                  <span>{streamer.viewers} expected viewers</span>
                  <a href="#global-trending" className="block w-full rounded-full bg-white/5 px-3 py-3 text-center text-emerald-300 transition hover:bg-white/10 sm:inline sm:w-auto">Follow / Join room</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fixtures" className="bg-[#040406] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Fixture preview</p>
              <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">Browse the next fan-ready matches.</h2>
            </div>
            <p className="max-w-xl text-sm text-white/70">Preview the next matches with demo room counts so fans can quickly find what to join.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {upcomingFixtures.map((fixture) => (
              <div key={fixture.teams} className="group overflow-hidden rounded-[1.75rem] border border-slate-700/40 bg-[radial-gradient(circle_at_top_left,rgba(30,64,175,0.08),transparent_45%),#02060d] p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.8)] transition hover:scale-[1.01] hover:border-emerald-400/30">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{fixture.tag}</p>
                <p className="mt-4 text-2xl font-bold text-white">{fixture.teams}</p>
                <p className="mt-3 text-sm text-slate-300">{fixture.date}</p>
                <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
                  <span>{fixture.rooms} rooms</span>
                  <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">Preview</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-700/40 bg-[#03101b] px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-emerald-400/10 bg-gradient-to-b from-slate-950 via-slate-900 to-[#061321] p-8 text-center shadow-lg shadow-emerald-500/10">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-200">Trust & safety</p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">No match footage. Creator-led reactions only.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            The platform keeps streams compliant and premium. Creators share reactions and chat — not the match feed.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a href="#apply" className="block w-full rounded-full bg-emerald-400 px-6 py-4 text-base font-semibold text-black text-center shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 sm:inline sm:w-auto">
              Apply to stream
            </a>
            <a href="#fixtures" className="block w-full rounded-full border border-slate-600 bg-slate-950/80 px-6 py-4 text-base font-semibold text-white text-center transition hover:bg-slate-900/90 sm:inline sm:w-auto">
              Explore fixtures
            </a>
          </div>
        </div>
      </section>

      <section id="apply" className="bg-[#050507] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-emerald-400/10 bg-gradient-to-br from-slate-950 via-slate-900 to-[#07151a] p-10 shadow-2xl shadow-emerald-400/10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Streamer application</p>
              <h2 className="mt-4 text-4xl font-black text-white">{translations[selectedLanguage].streamerApplicationHeading}</h2>
              <p className="mt-4 text-slate-300">
                Fill out the form to join the platform. Applications are saved locally in your browser for this MVP.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-[#06131d] p-8 text-white/80 shadow-inner shadow-black/20 ring-1 ring-slate-700/30">
              {submitted ? (
                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">Application received</p>
                  <h3 className="mt-4 text-2xl font-bold text-white">Thanks for applying!</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    We’ve got your streamer pitch and will reach out as we build the platform.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <label className="block text-base sm:text-sm text-white/70">
                    <span className="text-white">Name</span>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#07131f] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="block text-base sm:text-sm text-white/70">
                    <span className="text-white">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-[#020405] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="block text-base sm:text-sm text-white/70">
                    <span className="text-white">Country</span>
                    <input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-[#020405] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="block text-base sm:text-sm text-white/70">
                    <span className="text-white">Team supported</span>
                    <input
                      name="team"
                      value={formData.team}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-[#020405] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="block text-base sm:text-sm text-white/70">
                    <span className="text-white">Main language</span>
                    <input
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-[#020405] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="block text-base sm:text-sm text-white/70">
                    <span className="text-white">Social media link</span>
                    <input
                      name="social"
                      value={formData.social}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-[#020405] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="block text-base sm:text-sm text-white/70">
                    <span className="text-white">Why would your room be entertaining?</span>
                    <textarea
                      name="entertainment"
                      value={formData.entertainment}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-[#020405] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-emerald-400 px-6 py-4 text-base font-semibold text-black transition hover:bg-emerald-300"
                  >
                    Submit application
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
