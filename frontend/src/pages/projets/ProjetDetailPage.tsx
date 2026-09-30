// src/pages/projets/ProjetDetailPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api, { API_BASE_URL } from '../../services/api';

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



export function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [projet, setProjet] = useState<ProjetComplet | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [imageActive, setImageActive] = useState(0);

    useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/projets/${id}`)
        .then((res) => {
        setProjet(res.data);
        })
        .catch((err) => {
        console.error('Erreur fetch:', err);
        if (err.response?.status === 404) {
            setErreur('Projet non trouvé.');
        } else {
            setErreur('Erreur de chargement.');
        }
        })
        .finally(() => setLoading(false));
    }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (erreur || !projet) {
    return (
      <div className="section-light">
        <div className="max-w-3xl mx-auto px-4 flex flex-col gap-4 items-center py-16">
          <p className="text-body-sm">{erreur || 'Projet non trouvé.'}</p>
          <button onClick={() => navigate('/projets')} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const toutesLesImages = [projet.image_couverture, ...projet.images.map((i) => i.fichier_url)];

  return (
    <div className="section-light">
      <div className="max-w-3xl mx-auto px-4 flex flex-col gap-6">
        <button onClick={() => navigate('/projets')} className="btn-secondary w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="card flex flex-col gap-4">
            <img
            src={`${API_BASE_URL}/uploads/${toutesLesImages[imageActive]}`}
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
                <img src={`${API_BASE_URL}/uploads/${img}`} className="w-full h-full object-cover" />                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {projet.domaines.map((d) => (
              <span key={d.id} className="badge-secondary">{d.nom}</span>
            ))}
          </div>

          <h1 className="heading-2">{projet.titre}</h1>
          <span className="text-caption">
            Publié par {projet.auteur_prenom} {projet.auteur_nom}
          </span>
          <p className="text-body whitespace-pre-line">{projet.description}</p>
        </div>
      </div>
    </div>
  );
}