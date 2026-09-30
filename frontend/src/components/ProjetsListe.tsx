import { useEffect, useState } from 'react';
import { Eye, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Projet {
  id: number;
  titre: string;
  description: string;
  image_couverture: string;
  visible_vitrine: boolean;
  auteur_id: number;
  auteur_nom: string;
  auteur_prenom: string;
  domaines: { id: number; nom: string }[];
}

export default function ProjetsListe({
  userId,
  isAdmin,
  onView,
  onEdit,
}: {
  userId: number;
  isAdmin: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
}) {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [suppressionId, setSuppressionId] = useState<number | null>(null);

  const chargerProjets = () => {
    setLoading(true);
    fetch('/api/projets', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setProjets(data.projets || []))
      .finally(() => setLoading(false));
      console.log(projets)
  };
  
  useEffect(() => {
    chargerProjets();
  }, []);

  const supprimer = async (id: number) => {
    if (!confirm('Supprimer ce projet définitivement ?')) return;
    setSuppressionId(id);
    try {
      const res = await fetch(`/api/projets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) setProjets((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setSuppressionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (projets.length === 0) {
    return <p className="text-body-sm text-center py-12">Aucun projet publié pour le moment.</p>;
  }

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {projets.map((projet) => {
        const peutModifier = projet.auteur_id === userId || isAdmin;
        return (
          <div key={projet.id} className="card flex flex-col gap-3">
            <img
              src={`/uploads/${projet.image_couverture}`}
              alt={projet.titre}
              className="w-full h-40 object-cover"
              style={{ borderRadius: 'var(--radius-md)' }}
            />

            <div className="flex flex-wrap gap-1">
              {projet.domaines.map((d) => (
                <span key={d.id} className="badge-secondary">{d.nom}</span>
              ))}
              {projet.visible_vitrine && <span className="badge-success">Vitrine</span>}
            </div>

            <h3 className="heading-3">{projet.titre}</h3>
            <p className="text-body-sm line-clamp-2">{projet.description}</p>
            <span className="text-caption">Par {projet.auteur_prenom} {projet.auteur_nom}</span>

            <div className="flex gap-2 mt-2">
              <button onClick={() => onView(projet.id)} className="btn-secondary flex-1 justify-center">
                <Eye className="w-4 h-4" /> Voir
              </button>
              {peutModifier && (
                <>
                  <button onClick={() => onEdit(projet.id)} className="btn-secondary justify-center">
                    <Pencil className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  </button>
                  <button
                    onClick={() => supprimer(projet.id)}
                    disabled={suppressionId === projet.id}
                    className="btn-secondary justify-center"
                    style={{ borderColor: 'var(--color-error)' }}
                  >
                    {suppressionId === projet.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--color-error)' }} />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}