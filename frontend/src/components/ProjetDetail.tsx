import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react';

interface ProjetComplet {
  id: number;
  titre: string;
  description: string;
  image_couverture: string;
  visible_vitrine: boolean;
  auteur_id: number;
  auteur_nom: string;
  auteur_prenom: string;
  domaines: { id: number; nom: string }[];
  images: { id: number; fichier_url: string }[];
}

export default function ProjetDetail({
  projetId,
  userId,
  isAdmin,
  onBack,
  onEdit,
  onDeleted,
}: {
  projetId: number;
  userId: number;
  isAdmin: boolean;
  onBack: () => void;
  onEdit: (id: number) => void;
  onDeleted: () => void;
}) {
  const [projet, setProjet] = useState<ProjetComplet | null>(null);
  const [loading, setLoading] = useState(true);
  const [suppression, setSuppression] = useState(false);
  const [imageActive, setImageActive] = useState(0);

  useEffect(() => {
    fetch(`/api/projets/${projetId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setProjet(data))
      .finally(() => setLoading(false));
  }, [projetId]);

  const supprimer = async () => {
    if (!confirm('Supprimer ce projet définitivement ?')) return;
    setSuppression(true);
    try {
      const res = await fetch(`/api/projets/${projetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) onDeleted();
    } finally {
      setSuppression(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!projet) {
    return <p className="text-body-sm text-center py-12">Projet non trouvé.</p>;
  }

  const peutModifier = projet.auteur_id === userId || isAdmin;
  const toutesLesImages = [projet.image_couverture, ...projet.images.map((i) => i.fichier_url)];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <button onClick={onBack} className="btn-secondary w-fit">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="card flex flex-col gap-4">
        {/* Image principale + miniatures */}
        <img
          src={`/uploads/${toutesLesImages[imageActive]}`}
          alt={projet.titre}
          className="w-full h-72 object-cover"
          style={{ borderRadius: 'var(--radius-lg)' }}
        />
        {toutesLesImages.length > 1 && (
          <div className="flex gap-2">
            {toutesLesImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setImageActive(i)}
                className="w-16 h-16 overflow-hidden"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: i === imageActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                }}
              >
                <img src={`/uploads/${img}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {projet.domaines.map((d) => (
            <span key={d.id} className="badge-secondary">{d.nom}</span>
          ))}
          {projet.visible_vitrine && <span className="badge-success">Sur la vitrine</span>}
        </div>

        <h1 className="heading-2">{projet.titre}</h1>
        <span className="text-caption">Publié par {projet.auteur_prenom} {projet.auteur_nom}</span>
        <p className="text-body whitespace-pre-line">{projet.description}</p>

        {peutModifier && (
          <div className="flex gap-2 mt-4">
            <button onClick={() => onEdit(projet.id)} className="btn-primary">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
            <button onClick={supprimer} disabled={suppression} className="btn-danger">
              {suppression ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}