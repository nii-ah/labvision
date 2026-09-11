// src/pages/ressources/RessourceListPage.tsx
import { useEffect, useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { FileText, Video, Headphones, Filter, ArrowLeft } from "lucide-react";
import { getRessources, getDomaines, type Ressource, type Domaine } from "../../services/ressource.service";

const typeIcons: Record<string, ReactElement> = {
  pdf:   <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  audio: <Headphones className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  pdf: "PDF",
  video: "Vidéo",
  audio: "Audio",
};

export function RessourceListPage() {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [domaineActif, setDomaineActif] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDomaines().then(setDomaines).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getRessources(domaineActif ?? undefined)
      .then(setRessources)
      .catch(() => setError("Impossible de charger les ressources pour le moment."))
      .finally(() => setLoading(false));
  }, [domaineActif]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        <div className="mb-8">
            <Link to="/home" className="flex items-center gap-2 text-label text-text-secondary hover:text-(--color-primary) mb-6 w-fit">
                      <ArrowLeft className="w-4 h-4" />
                      Retour à l'accueil
                    </Link>
          <h1 className="heading-1">Ressources pédagogiques</h1>
          <p className="text-body mt-2">
            Documents, vidéos et podcasts pour apprendre et partager le savoir-faire du FabLab.
          </p>
        </div>

        {/* Filtres par domaine */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="flex items-center gap-1.5 text-label text-text-secondary">
            <Filter className="w-4 h-4" />
            Filtrer :
          </span>
          <button
            onClick={() => setDomaineActif(null)}
            className={domaineActif === null ? "btn-primary-sm" : "badge-neutral"}
          >
            Tous
          </button>
          {domaines.map((d) => (
            <button
              key={d.id}
              onClick={() => setDomaineActif(d.id)}
              className={domaineActif === d.id ? "btn-primary-sm" : "badge-neutral"}
            >
              {d.nom}
            </button>
          ))}
        </div>

        {/* États de chargement / erreur / vide */}
        {loading && (
          <p className="text-body-sm">Chargement des ressources...</p>
        )}

        {error && (
          <p className="text-body-sm" style={{ color: "var(--color-error)" }}>{error}</p>
        )}

        {!loading && !error && ressources.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-body">Aucune ressource disponible pour le moment.</p>
          </div>
        )}

        {/* Grille de ressources */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ressources.map((ressource) => (
            <Link
              key={ressource.id}
              to={`/ressources/${ressource.id}`}
              className="card hover:shadow-(--shadow-md) transition"
            >
              {ressource.image_url && (
                <img
                  src={ressource.image_url}
                  alt={ressource.titre}
                  className="w-full h-36 object-cover rounded-sm mb-3"
                />
              )}
              <div className="flex items-start justify-between mb-3">
                <span className="badge-secondary flex items-center gap-1">
                  {typeIcons[ressource.format]}
                  {typeLabels[ressource.format]}
                </span>
                <span className="text-caption">{ressource.niveau}</span>
              </div>
              <h3 className="heading-3 mb-2">{ressource.titre}</h3>
              {ressource.description && (
                <p className="text-body-sm line-clamp-2">{ressource.description}</p>
              )}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}