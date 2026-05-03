/**
 * LandingPage.jsx — Plateforme Lab'Vision
 * École Polytechnique d'Antsiranana (ESP)
 * Modifié pour refléter l'inclusion, les énergies renouvelables et le développement durable
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoLabVision from "../assets/icons/logo_labVision.png";
import femme from "../assets/facebook/femme.jpg";
import hero from "../assets/facebook/hero1.jpg"
import logoESP from "../assets/facebook/logoESP.jpg"
import logoUNA from "../assets/facebook/logoUNA.jpg"
import logoDA from "../assets/facebook/logoDA.png"
import projet1 from "../assets/facebook/projet1.jpg"
import projet2 from "../assets/facebook/projet2.jpg"
import projet3 from "../assets/facebook/projet3.jpg"
import projet4 from "../assets/facebook/projet4.jpg"
import {
  MessageSquare,
  Share2,
  Lightbulb,
  Globe,
  Cpu,
  Leaf,
  Mail,
  MapPin,
  Volume2,
  Video,
  FileText,
  BatteryFull,
  Handshake,
} from "lucide-react";

// ─── Contenu traduit (Français / Malagasy) ───────────────────────────────────


const translations = {
  fr: {
    tagline: "Innovation & Fabrication",
    navSignup: "S'inscrire",
    navLogin: "Connexion",

    // Bannière Science & Entrepreneuriat au Féminin
    bannerBadge: "Programme phare",
    bannerTitle: "Science et Entrepreneuriat pour les femmes",
    bannerDesc:
      "Lab'Vision s'engage à promouvoir les jeunes femmes dans les sciences, la technologie et l'entrepreneuriat. Nous formons les jeunes filles au numérique pour bâtir l'Afrique de demain.",
    bannerCTA: "Rejoindre le programme",

    // Hero
    heroTitle: "Bienvenue sur la plateforme ",
    heroDesc:
      "Un espace collaboratif et inclusif pour l'innovation technologique, les énergies renouvelables et le développement durable — ouvert aux étudiants, chercheurs et makers de Madagascar.",
    heroCTA1: "Devenir Membre",
    heroCTA2: "Déposer un Projet",
    stat1Title: "Communauté Active",
    stat1Desc: "Étudiants, chercheurs et makers",
    stat2Title: "Équipements Pro",
    stat2Desc: "Machines de fabrication numérique",
    stat3Title: "Accès Inclusif",
    stat3Desc: "Ressources en langues locales",

    // Projets
    sectionProjetsTitle: "Projets menés par l’association",
    sectionProjetsDesc:
      "Découvrez les projets innovants de l'association",

    // Événements
    sectionEvtsTitle: "Événements à Venir",
    sectionEvtsDesc:
      "Participez à nos ateliers, formations et événements communautaires",

    // Communauté
    sectionCommTitle: "Communauté et Partage",
    sectionCommDesc:
      "Lab'Vision favorise la co-conception et le partage de connaissances entre étudiants, chercheurs et makers — en ligne comme en présentiel.",
    commCard1Title: "Partage de Projets",
    commCard1Desc:
      "Publiez vos travaux, recevez des retours et collaborez avec d'autres membres sur des projets innovants.",
    commCard2Title: "Espaces de Discussion",
    commCard2Desc:
      "Forums thématiques, groupes de travail et canaux dédiés aux énergies renouvelables, IoT, impression 3D…",
    commCard3Title: "Co-conception",
    commCard3Desc:
      "Réunissez des profils complémentaires — ingénieurs, designers, entrepreneurs — pour créer des solutions à fort impact.",

    // Ressources
    sectionResTitle: "Ressources et Formation",
    sectionResDesc:
      "Notre bibliothèque de ressources est conçue pour être accessible à tous, y compris dans les zones rurales et à faible connectivité, avec les formats suivants :",
    resFormat1: "Audio",
    resFormat1Desc:
      "Contenus écoutables hors-ligne, en français et en malagasy.",
    resFormat2: "Vidéo",
    resFormat2Desc: "Tutoriels visuels adaptés aux débutants.",
    resFormat3: "Textuel",
    resFormat3Desc: "Guides PDF et fiches pratiques téléchargeables.",
    resCTA: "Accéder à l'espace Ressources et Formation",

    // Partenaires
    sectionPartTitle: "Nos Partenaires Institutionnels",
    sectionPartDesc:
      "Lab'Vision est portée par un écosystème académique et international engagé pour l'innovation inclusive.",

    // Footer
    footerNav: "Navigation",
    footerContact: "Contact",
    footerSocial: "Réseaux Sociaux",
    footerDesc:
      "Laboratoire d'innovation collaborative pour la création de projets technologiques durables.",
    footerRights:
      "© 2026 FabLab Lab'Vision — ESP Antsiranana. Tous droits réservés.",
  },

  mg: {
    tagline: "Fanaovana sy Fanavaozana",
    navSignup: "Hiditra",
    navLogin: "Miditra",

    bannerBadge: "Programa lehibe",
    bannerTitle: "Siansa sy Fiahiana ho an'ny Vehivavy",
    bannerDesc:
      "Manohana ny tanora vehivavy amin'ny siansa, teknolôjia ary fiahiana Lab'Vision. Mampianatra ny ankizy madinika ny fahaiza-mampiasa ny informatika mba hanorina ny Afrika ho avy.",
    bannerCTA: "Midira amin'ny programa",

    heroTitle: "Tongasoa amin'ny Lab'Vision",
    heroDesc:
      "Toerana ifanombohan'ny hevitra sy fanavaozana teknolôjia, angovo azo havaozina ary fampandrosoana maharitra — misokatra ho an'ny mpianatra, mpikaroka ary makers eto Madagasikara.",
    heroCTA1: "Lasa Mpikambana",
    heroCTA2: "Alefa Tetikasa",
    stat1Title: "Fiarahamonina Mavitrika",
    stat1Desc: "Mpianatra, mpikaroka ary makers",
    stat2Title: "Fitaovana Profesionaly",
    stat2Desc: "Milina famoronana nomerika",
    stat3Title: "Fidirana Tsy Misy Fizarazarana",
    stat3Desc: "Loharanon'asa amin'ny fiteny eto an-toerana",

    sectionProjetsTitle: "Tetikasa Mandeha",
    sectionProjetsDesc: "Hitanao ireo tetikasa vaovao vitan'ny mpikambana",

    sectionEvtsTitle: "Hetsika Farany Avy",
    sectionEvtsDesc: "Andrao ataontsika fiofanana sy hetsika fiaraha-miasa",

    sectionCommTitle: "Fiarahamonina sy Fizarana",
    sectionCommDesc:
      "Manohana ny fanampiana sy fizarana fahalalana amin'ny mpianatra, mpikaroka ary makers — an-tserasera sy mivantana.",
    commCard1Title: "Fizarana Tetikasa",
    commCard1Desc:
      "Asangano ny asanao, mahazo hevitra ary miara-miasa amin'ny mpikambana hafa.",
    commCard2Title: "Toerana Fifanakalozan-kevitra",
    commCard2Desc:
      "Fikaonan-doha, vondrona miasa ary lela manokana ho an'ny angovo azo havaozina, IoT, printy 3D…",
    commCard3Title: "Famoronana Iraisana",
    commCard3Desc:
      "Mampivory profily mifanaraka — injeniera, dizainera, mpandraharaha — mba hamoronana vahaolana mahomby.",

    sectionResTitle: "Loharanon'asa sy Fiofanana",
    sectionResDesc:
      "Ny lisitry ny loharanon'asa dia natao ho azon'ny rehetra, ao anatin'izany ny faritra ambanivohitra sy misy fifandraisana ambany.",
    resFormat1: "Feo",
    resFormat1Desc:
      "Votoatiny azo henoina tsy misy internet, amin'ny teny frantsay sy malagasy.",
    resFormat2: "Video",
    resFormat2Desc:
      "Fampianarana hita maso nalain-tahaka ho an'ny mpianatra vaovao.",
    resFormat3: "Lahatsoratra",
    resFormat3Desc: "Torolalana PDF sy tahirin-kevitra azo alaina.",
    resCTA: "Miditra amin'ny Toerana Loharanon'asa sy Fiofanana",

    sectionPartTitle: "Mpiara-miombon'antoka Institisionaly",
    sectionPartDesc:
      "Lab'Vision dia tarihan'ny fikambanana akademika sy iraisam-pirenena mianteheraka amin'ny fanavaozana tsy misy fizarazarana.",

    footerNav: "Navigasiona",
    footerContact: "Fifandraisana",
    footerSocial: "Tambajotra Sosialy",
    footerDesc: "Laboratoara fiaraha-mamorona tetikasa teknolôjia maharitra.",
    footerRights:
      "© 2026 FabLab Lab'Vision — ESP Antsiranana. Zo rehetra voatokana.",
  },
};

// ─── Données statiques (communes aux deux langues) ────────────────────────────
const projets = [
  {
    id: 1,
    titre: "Séchoir intelligent",
    description:
      "Un séchoir conçu pour les aliments coupés en fines tranches, permettant un séchage plus rapide et homogène.",
    image: projet1,
    categorie: "Développement durable",
    icon: <Leaf className="w-4 h-4" />,
  },
  {
    id: 2,
    titre: "Éolienne verticale",
    description:
      "Une éolienne à axe vertical conçue pour produire de l’énergie renouvelable, même avec des vents faibles.",
    image: projet2,
    categorie: "Énergie renouvelable",
    icon: <BatteryFull className="w-4 h-4" />,
  },
  {
    id: 3,
    titre: "Séances de partage",
    description:
      "L'association met l'accent sur le partage des connaissances. LabVision organise plusieurs séances de partage sur différents thèmes.",
    image: projet4,
    categorie: "Partage",
    icon: <Handshake className="w-4 h-4" />,
  },
  {
    id: 4,
    titre: "Matériel électronique de l'association",
    description:
      "L'association LabVision dispose de plusieurs matériels empruntables, notamment des composants électroniques et numériques.",
    image: projet3,
    categorie: "Matériel",
    icon: <Cpu className="w-4 h-4" />,
  },
];

{/**
    const evenements = [
  {
    id: 1,
    titre: "Atelier Impression 3D",
    date: "25 Mars 2026",
    heure: "14:00 - 17:00",
    description:
      "Apprenez les bases de l'impression 3D et créez votre premier objet.",
  },
  {
    id: 2,
    titre: "Hackathon Innovation",
    date: "2 Avril 2026",
    heure: "09:00 - 18:00",
    description:
      "24 heures pour développer un projet innovant avec votre équipe.",
  },
  {
    id: 3,
    titre: "Formation Arduino",
    date: "10 Avril 2026",
    heure: "10:00 - 16:00",
    description: "Initiation à la programmation de microcontrôleurs Arduino.",
  },
];
 */}

// ─── Partenaires institutionnels ──────────────────────────────────────────────
const partenaires = [
  {
    id: 1,
    sigle: "ESP",
    nom: "École Polytechnique d'Antsiranana",
    couleur: "bg-blue-100 text-blue-800",
  },
  {
    id: 2,
    sigle: "UNA",
    nom: "Université d'Antsiranana",
    couleur: "bg-green-100 text-green-800",
  },
  {
    id: 3,
    sigle: "DA",
    nom: "Diasporeines Africa",
    couleur: "bg-purple-100 text-purple-800",
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────
export function LandingPage() {
  // État de la langue active : "fr" ou "mg"
  const [lang, setLang] = useState("fr");
  const t = (translations as any)[lang];;
  const navigate = useNavigate();


  // Bascule entre les deux langues
  const toggleLang = () => setLang((prev) => (prev === "fr" ? "mg" : "fr"));


  return (
    <div className="min-h-screen bg-white">
      {/* ── HEADER NAVIGATION ──────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Logo + Nom */}
            <div className="flex items-center gap-2">
              <div className="w-20 h-20 flex items-center justify-center">
                {/* Fallback si l'image n'est pas disponible */}
                <img src={logoLabVision} alt="Logo" className="w-20 h-20" />
              </div>
              <div>
                <h1 className="font-bold text-xl lg:text-3xl font-[Noto sans] text-gray-800">
                  FabLab Lab'Vision
                </h1>
                <p className="text-sm text-gray-500">{t.tagline}</p>
              </div>
            </div>

            {/* Navigation droite + sélecteur de langue */}
            <div className="flex items-center gap-2">
              {/* ── Sélecteur de langue ── */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-indigo-50 rounded-lg transition border border-gray-200"
                aria-label="Changer de langue / Hanova fiteny"
              >
                <Globe className="w-4 h-4" />
                {lang === "fr" ? "Malagasy" : "Français"}
              </button>

               <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                {t.navSignup}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                {t.navLogin}
              </button>
            </div>
          </div>
        </div>
      </header>

    
      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
        {/* ── HERO SECTION AMÉLIORÉE ── */}
        <section
        className="relative bg-black flex items-center" // relative, bg-black par défaut, hauteur minimale pour l'effet "plein écran", flex-center
        style={{
            backgroundImage: `url(${hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
        >
        {/* Voile Noire (Overlay) - Technique par Div pour plus de contrôle */}
        <div className="absolute inset-0 bg-black/80 z-0"></div> {/* bg-black/60 = noir à 60% d'opacité */}

        <div className="max-w-7xl mx-auto px-6 py-28 relative z-10 w-full">
        <div className=" text-center">
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-title tracking-tight">
            {/* Le titre principal */}
            <span className="block mb-2">{t.heroTitle}</span>
            
            {/* Le nom "Lab'Vision" mis en valeur */}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#4facfe] to-[#8e2de2] drop-shadow-lg">
                Lab'Vision
            </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-100 leading-relaxed opacity-90 border-l-4 border-white/20 pl-6">
            {t.heroDesc}
            </p>
              {/**
               * <div className="flex gap-4 flex-wrap">
               * <Link
                to="/inscription"
                className="px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                {t.heroCTA1}
              </Link>
              <Link
                to="/dashboard/projets"
                className="px-6 py-3 text-base font-medium text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition border border-blue-200"
              >
                {t.heroCTA2}
              </Link>
              </div>
               */}
          </div>
        </div>
      </section>

      {/* ── PROJETS EN COURS ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.sectionProjetsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.sectionProjetsDesc}
            </p>
          </div>

          {/* Grille responsive : 1 col mobile → 2 tablette → 4 desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projets.map((projet) => (
              <div
                key={projet.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={projet.image}
                  alt={projet.titre}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full mb-3">
                    {projet.icon}
                    {projet.categorie}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {projet.titre}
                  </h3>
                  <p className="text-sm text-gray-600 ">
                    {projet.description}
                  </p>
                </div>
              </div>
            ))} 
          </div>
        </div>
      </section>

      {/* ── BANNIÈRE : SCIENCE ET ENTREPRENEURIAT AU FÉMININ ───────────────── */}
      {/*
       * Section dédiée au programme d'inclusion des jeunes femmes.
       * Positionnée juste sous le header pour une visibilité maximale.
       */}
      <section className="bg-linear-to-r from-cyan-600 to-indigo-600  text-white ">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Texte principal */}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {t.bannerTitle}
              </h2>
              <p className="text-white/90 text-base leading-relaxed max-w-2xl">
                {t.bannerDesc}
              </p>
            </div>

            <div className="shrink-0">
              <img src={femme} alt="SCIENCE ET ENTREPRENEURIAT AU FÉMININ" className="h-2xl w-2xl" />
            </div>

            {/* CTA
            <div className="shrink-0">
              <Link
                to="/programme-feminin"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition"
              >
                {t.bannerCTA}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div> */}
            
          </div>
        </div>
      </section>

      {/* ── ACTUALITE ──────────────────────────────────────────────── */}
      {/**
       * <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.sectionEvtsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.sectionEvtsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {evenements.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-600 mb-1">
                      {event.date}
                    </div>
                    <div className="text-sm text-gray-500">{event.heure}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {event.titre}
                </h3>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
       */}

      
             {/* ── COLONNE GAUCHE : COMMUNAUTÉ ── */}
      <section className="bg-gray-50 py-24"> {/* Fond légèrement gris pour détacher les cartes blanches */}
  <div className="max-w-7xl mx-auto px-6">
    
    {/* Conteneur principal en Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      
      {/* ── COLONNE GAUCHE : COMMUNAUTÉ ── */}
      <div className="space-y-10">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {t.sectionCommTitle}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t.sectionCommDesc}
          </p>
        </div>

        <div className="grid gap-4">
          {[
            { title: t.commCard1Title, desc: t.commCard1Desc, icon: <Share2 />, color: "bg-blue-600" },
            { title: t.commCard2Title, desc: t.commCard2Desc, icon: <MessageSquare />, color: "bg-indigo-600" },
            { title: t.commCard3Title, desc: t.commCard3Desc, icon: <Lightbulb />, color: "bg-purple-600" }
          ].map((item, idx) => (
            <div key={idx} className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex gap-5 items-center border border-gray-100">
              <div className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg`}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLONNE DROITE : RESSOURCES (Version Dark / Brand) ── */}
        <div className="bg-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 relative overflow-hidden text-white border border-white/10">
        
        {/* Effet de lueur (Glow) inspiré du logo Lab'Vision */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 bg-linear-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            {t.sectionResTitle}
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
            {t.sectionResDesc}
            </p>

            <div className="space-y-4 mb-10">
            {/* Items Format avec style "Glassmorphism" */}
            {[
                { label: t.resFormat1, icon: <Volume2 />, color: "text-cyan-400" },
                { label: t.resFormat2, icon: <Video />, color: "text-indigo-400" },
                { label: t.resFormat3, icon: <FileText />, color: "text-purple-400" }
            ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group">
                <div className={`${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                </div>
                <span className="font-medium text-gray-200">{item.label}</span>
                </div>
            ))}
            </div>

            {/* Bouton CTA réactivé avec un style contrasté */}
            {/**<Link
            to="/ressources"
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#0f172a] hover:bg-cyan-50 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
            <BookOpen className="w-5 h-5" />
            {t.resCTA}
            </Link> */}
        </div>
      </div>

    </div>
  </div>
      </section>


      {/* ── PARTENAIRES INSTITUTIONNELS (nouvelle section) ──────────────────── */}
      {/*
       * Affiche les logos/noms des partenaires : ESP, UNA, Diasporeines Africa.
       * Renforce la crédibilité académique de la plateforme.
       */}
      <section className="py-10 bg-white shadow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-5">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.sectionPartTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.sectionPartDesc}
            </p>
          </div>

          <div className="flex flex-wrap justify-center">
  <div className="flex items-center gap-30 px-10 py-8 min-w-50">

    <a href="https://espantsiranana.mg/" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110">
      <div className="w-40 h-40 flex items-center justify-center text-2xl">
        <img src={logoESP} alt="logoESP" />
      </div>
    </a>

    <a href="https://univants.mg/" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110">
      <div className="w-40 h-40 flex items-center justify-center text-2xl">
        <img src={logoUNA} alt="logoUNA" />
      </div>
    </a>

    <a href="https://diasporeines.org/" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110">
      <div className="w-40 h-40 flex items-center justify-center text-2xl">
        <img src={logoDA} alt="logoDA" />
      </div>
    </a>

  </div>
</div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Présentation */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoLabVision} alt="logoLabVision" className="w-15 h-15"/>
                <span className="font-semibold">FabLab Lab'Vision</span>
              </div>
              <p className="text-sm text-gray-400">{t.footerDesc}</p>
            </div>

            {/* Navigation */}
            {/**<div>
              <h4 className="font-semibold mb-4">{t.footerNav}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#projets" className="hover:text-white transition">
                    Projets
                  </a>
                </li>
                <li>
                  <a href="#evenements" className="hover:text-white transition">
                    Événements
                  </a>
                </li>
                <li>
                  <a href="#ressources" className="hover:text-white transition">
                    Ressources
                  </a>
                </li>
                <li>
                  <Link
                    to="/inscription"
                    className="hover:text-white transition"
                  >
                    {t.navSignup}
                  </Link>
                </li>
              </ul>
            </div> */}

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">{t.footerContact}</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  contact@labvision.mg
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  ESP, Antsiranana, Madagascar
                </li>
              </ul>
            </div>

            {/* Partenaires (résumé footer) */}
            <div>
              <h4 className="font-semibold mb-4">{t.sectionPartTitle}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {partenaires.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span>{p.nom}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bas de footer */}
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>{t.footerRights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
