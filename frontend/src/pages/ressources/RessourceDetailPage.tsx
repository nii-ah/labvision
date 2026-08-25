// src/pages/ressources/RessourceDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Video, Headphones, Download, Lock } from "lucide-react";
import { getRessourceById, type RessourceDetail } from "../../services/ressource.service";

const typeIcons: Record<string, React.ReactElement> = {
  pdf:   <FileText className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  audio: <Headphones className="w-5 h-5" />,
};

const typeLabels: Record<string, string> = {
  pdf: "PDF",
  video: "Vidéo",
  audio: "Audio",
};

export function RessourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ressource, setRessource] = useState<RessourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getRessourceById(id)
      .then(setRessource)
      .catch(() => setError("Cette ressource est introuvable ou n'est plus disponible."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-body-sm">Chargement...</p>
      </div>
    );
  }

  if (error || !ressource) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-body">{error}</p>
        <Link to="/ressources" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Retour aux ressources
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        <Link to="/ressources" className="flex items-center gap-2 text-label text-text-secondary hover:text-(--color-primary) mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Retour aux ressources
        </Link>

        {ressource.image_url && (
          <img
            src={ressource.image_url}
            alt={ressource.titre}
            className="w-full h-64 object-cover rounded-(--radius-lg) mb-6"
          />
        )}

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="badge-secondary flex items-center gap-1">
            {typeIcons[ressource.format]}
            {typeLabels[ressource.format]}
          </span>
          <span className="badge-neutral">{ressource.niveau}</span>
          <span className="badge-neutral">{ressource.langue}</span>
        </div>

        <h1 className="heading-1 mb-3">{ressource.titre}</h1>

        <p className="text-caption mb-6">
          Publié par {ressource.auteur_prenom} {ressource.auteur_nom}
        </p>

        {ressource.description && (
          <p className="text-body mb-8">{ressource.description}</p>
        )}

        {ressource.domaines?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {ressource.domaines.map((d) => (
              <span key={d.id} className="badge-primary">{d.nom}</span>
            ))}
          </div>
        )}

        <div className="card">
          {ressource.fichier_url ? (
            <a
              href={ressource.fichier_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-lg w-full justify-center"
            >
              <Download className="w-5 h-5" />
              Télécharger / Consulter
            </a>
          ) : (
            <div className="flex items-center gap-3 text-text-secondary">
              <Lock className="w-5 h-5" />
              <p className="text-body-sm">
                Connectez-vous pour accéder au contenu complet de cette ressource.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}