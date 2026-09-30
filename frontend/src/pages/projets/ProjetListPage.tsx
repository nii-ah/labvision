// src/pages/projets/ProjetListPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Filter, Eye, Loader2, Plus } from 'lucide-react';
import api, { API_BASE_URL } from '../../services/api';

interface Domaine {
  id: number;
  nom: string;
}

interface Projet {
  id: number;
  titre: string;
  description: string;
  image_couverture: string;
  visible_vitrine: boolean;
  auteur_id: number;
  auteur_nom: string;
  auteur_prenom: string;
  domaines: Domaine[];
}



export function ProjetListPage() {
  const navigate = useNavigate();

  const [projets, setProjets] = useState<Projet[]>([]);
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [domaineActif, setDomaineActif] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api.get('/domaines')
      .then((res) => setDomaines(res.data.domaines || res.data))
      .catch(() => setDomaines([]));
  }, []);

  const chargerProjets = () => {
    setLoading(true);
    api.get('/projets')
      .then((res) => setProjets(res.data.projets || []))
      .catch(() => setErreur('Impossible de charger les projets.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    chargerProjets();
  }, []);


  const projetsFiltres = domaineActif
    ? projets.filter((p) => p.domaines.some((d) => d.id === domaineActif))
    : projets;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        <div className="mb-8">
          <Link to="/home" className="flex items-center gap-2 text-label text-text-secondary hover:text-(--color-primary) mb-6 w-fit">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1">Projets du FabLab</h1>
              <p className="text-body mt-2">
                Prototypes, recherches et réalisations concrètes partagés par la communauté Lab'Vision.
              </p>
            </div>
            <button onClick={() => navigate('/projets/nouveau')} className="btn-primary">
              <Plus className="w-4 h-4" /> Nouveau projet
            </button>
          </div>
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

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {!loading && erreur && (
          <div className="badge-danger w-fit">{erreur}</div>
        )}

        {!loading && !erreur && projetsFiltres.length === 0 && (
          <p className="text-body-sm text-center py-16">Aucun projet trouvé.</p>
        )}

        {!loading && !erreur && projetsFiltres.length > 0 && (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {projetsFiltres.map((projet) => {
              return (
                <div
                  key={projet.id}
                  onClick={() => navigate(`/projets/${projet.id}`)}
                  className="card flex flex-col gap-3 cursor-pointer transition-shadow"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                >
                  <img
                    src={`${API_BASE_URL}/uploads/${projet.image_couverture}`}
                    alt={projet.titre}
                    className="w-full h-44 object-cover"
                    style={{ borderRadius: 'var(--radius-md)' }}
                  />

                  <div className="flex flex-wrap gap-1">
                    {projet.domaines.map((d) => (
                      <span key={d.id} className="badge-secondary">{d.nom}</span>
                    ))}
                  </div>

                  <h3 className="heading-3">{projet.titre}</h3>
                  <p className="text-body-sm line-clamp-2">{projet.description}</p>
                  <span className="text-caption">
                    Par {projet.auteur_prenom} {projet.auteur_nom}
                  </span>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/projets/${projet.id}`); }}
                      className="btn-primary flex-1 justify-center"
                    >
                      <Eye className="w-4 h-4" /> Voir les détails
                    </button>

                   
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}