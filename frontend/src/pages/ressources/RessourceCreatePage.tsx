// src/pages/ressources/RessourceCreatePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, X } from "lucide-react";
import { createRessource } from "../../services/ressource.service";
import { getDomaines, type Domaine } from "../../services/ressource.service";
import { isAdmin } from "../../utils/auth";

const FORMAT_ACCEPT: Record<string, string> = {
  pdf: "application/pdf",
  audio: "audio/mpeg,audio/mp3,audio/wav,audio/ogg",
  video: "video/mp4,video/webm,video/ogg",
};

export function RessourceCreatePage() {
  const navigate = useNavigate();
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    niveau: "Débutant",
    langue: "Français",
    format: "pdf" as "pdf" | "audio" | "video",
    telechargeable: false,
    domaine_ids: [] as number[],
  });
  const [fichier, setFichier] = useState<File | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/home");
      return;
    }
    getDomaines().then(setDomaines).catch(() => {});
  }, [navigate]);

  const toggleDomaine = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      domaine_ids: prev.domaine_ids.includes(id)
        ? prev.domaine_ids.filter((d) => d !== id)
        : [...prev.domaine_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fichier) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }
    if (formData.domaine_ids.length === 0) {
      setError("Sélectionnez au moins un domaine.");
      return;
    }

    setLoading(true);
    try {
      await createRessource({ ...formData, fichier });
      navigate("/ressources");
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        setError(Object.values(data.errors).flat().join(" "));
      } else {
        setError(data?.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <h1 className="heading-1 mb-2">Publier une ressource</h1>
        <p className="text-body mb-8">
          Ajoutez un contenu pédagogique à la bibliothèque Lab'Vision.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-sm" style={{ background: "#FEF2F2", border: "1px solid var(--color-border-error)" }}>
            <p className="text-body-sm" style={{ color: "var(--color-error)" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-label block mb-1">Titre</label>
            <input
              type="text"
              className="input-base"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-label block mb-1">Description</label>
            <textarea
              className="input-base"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label block mb-1">Niveau</label>
              <select
                className="input-base"
                value={formData.niveau}
                onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
              >
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>
            </div>
            <div>
              <label className="text-label block mb-1">Langue</label>
              <select
                className="input-base"
                value={formData.langue}
                onChange={(e) => setFormData({ ...formData, langue: e.target.value })}
              >
                <option>Français</option>
                <option>Malagasy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-label block mb-1">Format</label>
            <select
              className="input-base"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value as any, })}
            >
              <option value="pdf">PDF</option>
              <option value="audio">Audio</option>
              <option value="video">Vidéo</option>
            </select>
          </div>

          <div>
            <label className="text-label block mb-2">Domaines</label>
            <div className="flex flex-wrap gap-2">
              {domaines.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => toggleDomaine(d.id)}
                  className={formData.domaine_ids.includes(d.id) ? "btn-primary-sm" : "badge-neutral"}
                >
                  {d.nom}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-label block mb-2">Fichier</label>
            <label className="card flex flex-col items-center justify-center gap-2 py-8 cursor-pointer border-dashed">
              <UploadCloud className="w-8 h-8" style={{ color: "var(--color-neutral)" }} />
              <span className="text-body-sm">
                {fichier ? fichier.name : "Cliquez pour sélectionner un fichier"}
              </span>
              <input
                type="file"
                accept={FORMAT_ACCEPT[formData.format]}
                className="hidden"
                onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
              />
            </label>
            {fichier && (
              <button
                type="button"
                onClick={() => setFichier(null)}
                className="text-caption flex items-center gap-1 mt-2"
                style={{ color: "var(--color-error)" }}
              >
                <X className="w-3 h-3" /> Retirer le fichier
              </button>
            )}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.telechargeable}
              onChange={(e) => setFormData({ ...formData, telechargeable: e.target.checked })}
            />
            <span className="text-body-sm">Autoriser le téléchargement</span>
          </label>

          <button type="submit" disabled={loading} className="btn-primary-lg w-full justify-center">
            {loading ? "Publication en cours..." : "Publier la ressource"}
          </button>

        </form>
      </div>
    </div>
  );
}