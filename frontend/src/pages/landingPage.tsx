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
import logoDA from "../assets/facebook/image.png"
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
    bannerBadge: "Programme phare",
    bannerTitle: "Science et Entrepreneuriat pour les femmes",
    bannerDesc:
      " Lab’Vision, initié par Diasporeines Africa, promeut les jeunes femmes dans les sciences, la technologie et l’entrepreneuriat. À travers le Fablab, des programmes de formation au numérique sont développés en collaboration étroite avec Diasporeines pour accompagner les jeunes filles vers les opportunités de demain",
    bannerCTA: "Rejoindre le programme",
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
    sectionProjetsTitle: "Projets menés par l'association",
    sectionProjetsDesc: "Découvrez les projets innovants de l'association",
    sectionEvtsTitle: "Événements à Venir",
    sectionEvtsDesc: "Participez à nos ateliers, formations et événements communautaires",
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
    sectionResTitle: "Ressources et Formation",
    sectionResDesc:
      "Notre bibliothèque de ressources est conçue pour être accessible à tous, y compris dans les zones rurales et à faible connectivité, avec les formats suivants :",
    resFormat1: "Audio",
    resFormat1Desc: "Contenus écoutables hors-ligne, en français et en malagasy.",
    resFormat2: "Vidéo",
    resFormat2Desc: "Tutoriels visuels adaptés aux débutants.",
    resFormat3: "Textuel",
    resFormat3Desc: "Guides PDF et fiches pratiques téléchargeables.",
    resCTA: "Accéder à l'espace Ressources et Formation",
    sectionPartTitle: "Nos Partenaires Institutionnels",
    sectionPartDesc:
      "Lab'Vision est portée par un écosystème académique et international engagé pour l'innovation inclusive.",
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
    resFormat1Desc: "Votoatiny azo henoina tsy misy internet, amin'ny teny frantsay sy malagasy.",
    resFormat2: "Video",
    resFormat2Desc: "Fampianarana hita maso nalain-tahaka ho an'ny mpianatra vaovao.",
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
    footerRights: "© 2026 FabLab Lab'Vision — ESP Antsiranana. Zo rehetra voatokana.",
  },
};

// ─── Données statiques ────────────────────────────────────────────────────────
const projets = [
  {
    id: 1,
    titre: "Séchoir intelligent",
    description: "Un séchoir conçu pour les aliments coupés en fines tranches, permettant un séchage plus rapide et homogène.",
    image: projet1,
    categorie: "Développement durable",
    icon: <Leaf className="w-4 h-4" />,
  },
  {
    id: 2,
    titre: "Éolienne verticale",
    description: "Une éolienne à axe vertical conçue pour produire de l'énergie renouvelable, même avec des vents faibles.",
    image: projet2,
    categorie: "Énergie renouvelable",
    icon: <BatteryFull className="w-4 h-4" />,
  },
  {
    id: 3,
    titre: "Séances de partage",
    description: "L'association met l'accent sur le partage des connaissances. LabVision organise plusieurs séances de partage sur différents thèmes.",
    image: projet4,
    categorie: "Partage",
    icon: <Handshake className="w-4 h-4" />,
  },
  {
    id: 4,
    titre: "Matériel électronique de l'association",
    description: "L'association LabVision dispose de plusieurs matériels empruntables, notamment des composants électroniques et numériques.",
    image: projet3,
    categorie: "Matériel",
    icon: <Cpu className="w-4 h-4" />,
  },
];

const partenaires = [
  { id: 1, sigle: "ESP", nom: "École Polytechnique d'Antsiranana", couleur: "bg-blue-100 text-blue-800" },
  { id: 2, sigle: "UNA", nom: "Université d'Antsiranana", couleur: "bg-green-100 text-green-800" },
  { id: 3, sigle: "DA", nom: "Diasporeines Africa", couleur: "bg-purple-100 text-purple-800" },
];

// ─── Composant principal ──────────────────────────────────────────────────────
export function LandingPage() {
  const [lang, setLang] = useState("fr");
  const [menuOpen, setMenuOpen] = useState(false); // [RESPONSIVE] menu mobile
  const t = (translations as any)[lang];
  const navigate = useNavigate();
  const toggleLang = () => setLang((prev) => (prev === "fr" ? "mg" : "fr"));

  return (
    <div className="min-h-screen bg-white">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between">

            {/* Logo + Nom */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
                {/* [RESPONSIVE] logo plus petit sur mobile */}
                <img src={logoLabVision} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-xl lg:text-3xl tracking-tight">
                <span className="text-slate-800">FabLab </span>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-indigo-600">
                    Lab'Vision
                </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">{t.tagline}</p>
              </div>
            </div>

            {/* Nav desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-indigo-50 rounded-lg transition border border-gray-200"
              >
                <Globe className="w-4 h-4" />
                {lang === "fr" ? "Malagasy" : "Français"}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                {t.navSignup}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                {t.navLogin}
              </button>
            </div>

            {/* [RESPONSIVE] Burger menu mobile */}
            <button
              className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <div className="w-5 h-0.5 bg-current mb-1"></div>
              <div className="w-5 h-0.5 bg-current mb-1"></div>
              <div className="w-5 h-0.5 bg-current"></div>
            </button>
          </div>

          {/* [RESPONSIVE] Menu déroulant mobile */}
          {menuOpen && (
            <div className="sm:hidden pt-3 pb-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-indigo-50 rounded-lg transition border border-gray-200 w-full"
              >
                <Globe className="w-4 h-4" />
                {lang === "fr" ? "Malagasy" : "Français"}
              </button>
              <button
                onClick={() => { navigate("/register"); setMenuOpen(false); }}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition text-left"
              >
                {t.navSignup}
              </button>
              <button
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                {t.navLogin}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-black flex items-center min-h-[60vh] sm:min-h-[70vh]"
        // [RESPONSIVE] hauteur minimale adaptée
        style={{
          backgroundImage: `url(${hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/80 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-28 relative z-10 w-full">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              {/* [RESPONSIVE] taille du titre hero adaptée */}
              <span className="block mb-2">{t.heroTitle}</span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#4facfe] to-[#8e2de2] drop-shadow-lg">
                Lab'Vision
              </span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-gray-100 leading-relaxed opacity-90 border-l-4 border-white/20 pl-4 sm:pl-6 text-left max-w-3xl mx-auto">
              {/* [RESPONSIVE] texte aligné à gauche sur tous les écrans pour lisibilité */}
              {t.heroDesc}
            </p>
          </div>
        </div>
      </section>

      {/* ── PROJETS ─────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t.sectionProjetsTitle}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {t.sectionProjetsDesc}
            </p>
          </div>

          {/* [RESPONSIVE] grille : 1 col → 2 col → 4 col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {projets.map((projet) => (
              <div
                key={projet.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={projet.image}
                  alt={projet.titre}
                  className="w-full h-44 sm:h-48 object-cover"
                />
                <div className="p-4 sm:p-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full mb-3">
                    {projet.icon}
                    {projet.categorie}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-2">{projet.titre}</h3>
                  <p className="text-sm text-gray-600">{projet.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNIÈRE FEMMES ──────────────────────────────────────────────────── */}
<section className="bg-linear-to-br from-cyan-700 to-indigo-700 text-white overflow-hidden relative">

  {/* Cercles décoratifs */}
  <div className="absolute -top-24 -right-16 w-72 h-72 bg-white/10 rounded-full pointer-events-none" />
  <div className="absolute -bottom-16 left-1/4 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />

  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10">
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

      {/* Contenu texte */}
      <div className="flex-1 text-center md:text-left">

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-snug">
          {t.bannerTitle}
        </h2>
        <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-xl mb-6 mx-auto md:mx-0">
          {t.bannerDesc}
        </p>

        {/* CTA */}
        <a
          href="https://diasporeines.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-800 text-sm font-semibold rounded-lg hover:bg-cyan-50 transition-colors"
        >
          Découvrir Diasporeines Africa
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M17 7H7m10 0v10" />
          </svg>
        </a>
      </div>

      {/* Image */}
      <div className="shrink-0 relative hidden sm:block">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border border-white/20 bg-white/10">
  <img
    src={femme}
    alt="Science et Entrepreneuriat au Féminin"
    className="w-full h-full object-cover"
  />
</div>
      </div>

    </div>
  </div>
</section>

      {/* ── COMMUNAUTÉ + RESSOURCES ──────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* [RESPONSIVE] 1 col mobile → 2 col desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Communauté */}
            <div className="space-y-8 sm:space-y-10">
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  {t.sectionCommTitle}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {t.sectionCommDesc}
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  { title: t.commCard1Title, desc: t.commCard1Desc, icon: <Share2 />, color: "bg-blue-600" },
                  { title: t.commCard2Title, desc: t.commCard2Desc, icon: <MessageSquare />, color: "bg-indigo-600" },
                  { title: t.commCard3Title, desc: t.commCard3Desc, icon: <Lightbulb />, color: "bg-purple-600" }
                ].map((item, idx) => (
                  <div key={idx} className="group bg-white p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 sm:gap-5 items-center border border-gray-100">
                    <div className={`${item.color} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ressources */}
            <div className="bg-slate-800 p-6 sm:p-8 md:p-12 rounded-4xl sm:rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 relative overflow-hidden text-white border border-white/10">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]"></div>

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-linear-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  {t.sectionResTitle}
                </h2>
                <p className="text-gray-400 mb-6 sm:mb-10 leading-relaxed text-sm sm:text-base">
                  {t.sectionResDesc}
                </p>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
                  {[
                    { label: t.resFormat1, icon: <Volume2 />, color: "text-cyan-400" },
                    { label: t.resFormat2, icon: <Video />, color: "text-indigo-400" },
                    { label: t.resFormat3, icon: <FileText />, color: "text-purple-400" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group">
                      <div className={`${item.color} group-hover:scale-110 transition-transform shrink-0`}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-200 text-sm sm:text-base">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PARTENAIRES ──────────────────────────────────────────────────────── */}
      <section className="py-10 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t.sectionPartTitle}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {t.sectionPartDesc}
            </p>
          </div>

          {/* [RESPONSIVE] flex-wrap avec gap raisonnable, logos centrés */}
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-16 px-4 py-6">
            <a href="https://espantsiranana.mg/" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110">
              <img src={logoESP} alt="logoESP" className="h-24 sm:h-32 md:h-40 w-auto object-contain" />
            </a>
            <a href="https://univants.mg/" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110">
              <img src={logoUNA} alt="logoUNA" className="h-24 sm:h-32 md:h-40 w-auto object-contain" />
            </a>
            <a href="https://diasporeines.org/" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110">
              <img src={logoDA} alt="logoDA" className="h-24 sm:h-32 md:h-40 w-auto object-contain" />
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* [RESPONSIVE] 1 col mobile → 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">

            {/* Présentation */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoLabVision} alt="logoLabVision" className="w-12 h-12 object-contain" />
                <span className="font-semibold">FabLab Lab'Vision</span>
              </div>
              <p className="text-sm text-gray-400">{t.footerDesc}</p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">{t.footerContact}</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  contact@labvision.mg
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  ESP, Antsiranana, Madagascar
                </li>
              </ul>
            </div>

            {/* Partenaires */}
            <div>
              <h4 className="font-semibold mb-4">{t.sectionPartTitle}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {partenaires.map((p) => (
                  <li key={p.id}>{p.nom}</li>
                ))}
              </ul>
            </div>

          </div>

          <div className="pt-6 sm:pt-8 border-t border-gray-800 text-center text-xs sm:text-sm text-gray-400">
            <p>{t.footerRights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
