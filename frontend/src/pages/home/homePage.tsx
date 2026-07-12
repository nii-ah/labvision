import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, FileText, FolderOpen, Users, Home} from "lucide-react";
import logoLabVision from "../../assets/icons/logo_labVision.png";

const partenaires = [
  { id: 1, nom: "École Polytechnique d'Antsiranana" },
  { id: 2, nom: "Université d'Antsiranana" },
  { id: 3, nom: "Diasporeines Africa" },
];

// Données statiques temporaires — à remplacer par des appels API plus tard
const projetsRecents = [
  {
    id: 1,
    titre: "Séchoir intelligent",
    description: "Un séchoir conçu pour les aliments coupés en fines tranches, permettant un séchage plus rapide et homogène.",
    categorie: "Développement durable",
    date: "15 juin 2026",
  },
  {
    id: 2,
    titre: "Éolienne verticale",
    description: "Une éolienne à axe vertical conçue pour produire de l'énergie renouvelable, même avec des vents faibles.",
    categorie: "Énergie renouvelable",
    date: "10 juin 2026",
  },
  {
    id: 3,
    titre: "Système d'irrigation automatique",
    description: "Un système d'irrigation connecté permettant de gérer l'arrosage à distance via une application mobile.",
    categorie: "Agriculture",
    date: "5 juin 2026",
  },
];

const ressourcesRecentes = [
  {
    id: 1,
    titre: "Introduction aux énergies renouvelables",
    description: "Guide complet sur les différentes sources d'énergie renouvelable et leur application à Madagascar.",
    type: "pdf",
    date: "20 juin 2026",
  },
  {
    id: 2,
    titre: "Tutoriel impression 3D",
    description: "Apprenez les bases de l'impression 3D avec les équipements disponibles au FabLab Lab'Vision.",
    type: "video",
    date: "18 juin 2026",
  },
  {
    id: 3,
    titre: "Introduction à l'électronique",
    description: "Podcast en malagasy pour découvrir les bases de l'électronique et des composants numériques.",
    type: "audio",
    date: "12 juin 2026",
  },
];

/*
const typeIcons: Record<string, JSX.Element> = {
  pdf:   <FileText className="w-4 h-4" />,
  video: <FolderOpen className="w-4 h-4" />,
  audio: <BookOpen className="w-4 h-4" />,
}; */

const typeLabels: Record<string, string> = {
  pdf:   "PDF",
  video: "Vidéo",
  audio: "Audio",
};

export function HomePage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("fr");
  const toggleLang = () => setLang((prev) => (prev === "fr" ? "mg" : "fr"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Récupérer le nom de l'utilisateur depuis localStorage
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <div className="min-h-screen bg-white">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <img src={logoLabVision} alt="Logo Lab'Vision" className="w-10 h-10 object-contain" />
              <span className="hidden sm:block  font-bold text-(--color-text-main) text-lg">
                FabLab <span className="gradient-text">Lab'Vision</span>
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-3">
              {[
                { label: "Accueil", path: "/home", icon: <Home className="w-4 h-4" /> },
                { label: "Projets", path: "/projets", icon: <FolderOpen className="w-4 h-4" /> },
                { label: "Ressources", path: "/ressources", icon: <FileText className="w-4 h-4" /> },
                { label: "Lab'Vision", path: "/labvision", icon: <Users className="w-4 h-4" /> },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-3 py-2 text-label border border-border text-text-secondary hover:text-(--color-primary) hover:bg-bg-alt rounded-sm transition"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-2 text-label text-text-secondary hover:bg-bg-alt rounded-sm transition border border-border"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:block">{lang === "fr" ? "Malagasy" : "Français"}</span>
              </button>

              {user && (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-(--color-primary) flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ── SECTION PRÉSENTATION LAB'VISION ────────────────── */}
      <section className="section-light border-b border-border shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="heading-1 mb-4">
              Bienvenue dans la plateforme de Lab'Vision
            </h1>
            <p className="text-body mb-8 ">
              Lab'Vision est un espace collaboratif et inclusif dédié à l'innovation technologique, 
              aux énergies renouvelables et au développement durable. Ouvert aux étudiants, 
              chercheurs et makers de Madagascar, il valorise les savoirs locaux et favorise 
              le partage de connaissances pour un impact durable.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/projets" className="btn-primary-lg">
                <FolderOpen className="w-5 h-5" />
                Voir les projets
              </Link>
              <Link to="/ressources" className="btn-secondary">
                <FileText className="w-5 h-5" />
                Parcourir les ressources
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION PROJETS RÉCENTS ────────────────────────── */}
      <section className="section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-2">Projets récents</h2>
              <p className="text-body-sm mt-1">Les dernières réalisations de la communauté Lab'Vision</p>
            </div>
            <Link to="/projets" className="btn-secondary">
              Voir tout
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projetsRecents.map((projet) => (
              <div
                key={projet.id}
                className="card hover:shadow-(--shadow-md) transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-primary">{projet.categorie}</span>
                  <span className="text-body-sm">{projet.date}</span>
                </div>
                <h3 className="heading-3 mb-2">{projet.titre}</h3>
                <p className="text-body-sm">{projet.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION RESSOURCES RÉCENTES ────────────────────── */}
      {/*
      <section className="section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-2">Ressources récentes</h2>
              <p className="text-body-sm mt-1">Contenus pédagogiques accessibles à tous les membres</p>
            </div>
            <Link to="/ressources" className="btn-secondary">
              Voir tout
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ressourcesRecentes.map((ressource) => (
              <div
                key={ressource.id}
                className="card hover:shadow-(--shadow-md) transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-secondary flex items-center gap-1">
                     {typeIcons[ressource.type]}
                     {typeLabels[ressource.type]}
                  </span>
                  <span className="text-caption">{ressource.date}</span>
                </div>
                <h3 className="heading-3 mb-2">{ressource.titre}</h3>
                <p className="text-body-sm">{ressource.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section> */}

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoLabVision} alt="Logo" className="w-10 h-10 object-contain" />
                <span className="text-label text-white">FabLab Lab'Vision</span>
              </div>
              <p className="text-body-sm text-gray-400">
                Laboratoire d'innovation collaborative pour la création de projets technologiques durables.
              </p>
            </div>

            <div>
              <h4 className="text-label text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-body-sm text-gray-400">
                <li>contact@labvision.mg</li>
                <li>ESP, Antsiranana, Madagascar</li>
              </ul>
            </div>

            <div>
              <h4 className="text-label text-white mb-4">Partenaires</h4>
              <ul className="space-y-2 text-body-sm text-gray-400">
                {partenaires.map((p) => (
                  <li key={p.id}>{p.nom}</li>
                ))}
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-white/10 text-center text-caption text-gray-500">
            © 2026 FabLab Lab'Vision — ESP Antsiranana. Tous droits réservés.
          </div>
        </div>
      </footer>

    </div>
  );
}