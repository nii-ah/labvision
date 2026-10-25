import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Star, StarOff, FileText, ArrowLeft } from 'lucide-react';
import { materielService, type Materiel } from '../../services/materiel.service';
import { isAdmin, canManageMateriels } from '../../utils/auth';

export default function MaterielsPage() {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  const peutGerer = canManageMateriels();
  const admin = isAdmin();

  const charger = async () => {
    try {
      setMateriels(await materielService.getAll());
    } catch {
      setErreur('Impossible de charger les matériels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return materiels;
    return materiels.filter(
      (m) =>
        m.nom.toLowerCase().includes(q) ||
        (m.description ?? '').toLowerCase().includes(q)
    );
  }, [materiels, recherche]);

  const supprimer = async (m: Materiel) => {
    if (!window.confirm(`Supprimer « ${m.nom} » et ses fichiers ?`)) return;
    try {
      await materielService.remove(m.id);
      setMateriels((prev) => prev.filter((x) => x.id !== m.id));
    } catch {
      setErreur('La suppression a échoué.');
    }
  };

  const basculerVitrine = async (m: Materiel) => {
    const nouvelleValeur = !m.visible_vitrine;
    try {
      await materielService.setVitrine(m.id, nouvelleValeur);
      setMateriels((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, visible_vitrine: nouvelleValeur } : x))
      );
    } catch {
      setErreur('Impossible de modifier la visibilité.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      <div className="mb-8">
        <Link to="/home" className="flex items-center gap-2 text-label text-text-secondary hover:text-primary mb-6 w-fit">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
        </Link>
        <div className="flex items-center justify-between ">
        <div>
          <h1 className="heading-1">Matériels</h1>
          <p className="text-body mt-2">Équipements disponibles au FabLab Lab'Vision.</p>
        </div>
        {peutGerer && (
          <Link to="/materiels/nouveau" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Ajouter un matériel
          </Link>
        )}
      </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#7a969f]" />
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un matériel..."
          className="input-base pl-10"
        />
      </div>

      {erreur && <p className="mb-4 text-sm text-[#DC2626]">{erreur}</p>}

      <div className="card overflow-x-auto p-0!">
        <table className="w-full text-left">
          <thead className="bg-bg-alt border-b border-[#E5E7EB]">
            <tr>
              <th className="px-4 py-3 label-ui">Nom</th>
              <th className="px-4 py-3 label-ui">Description</th>
              <th className="px-4 py-3 label-ui text-center">Quantité</th>
              <th className="px-4 py-3 label-ui text-center">Fichiers</th>
              {connecteAvecVitrine(peutGerer) && <th className="px-4 py-3 label-ui">Vitrine</th>}
              <th className="px-4 py-3 label-ui text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-body">
                  Chargement...
                </td>
              </tr>
            )}

            {!loading && filtres.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-body">
                  Aucun matériel à afficher.
                </td>
              </tr>
            )}

            {filtres.map((m) => (
              <tr key={m.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-bg-alt">
                <td className="px-4 py-3 font-bold text-bg-dark">{m.nom}</td>
                <td className="px-4 py-3 text-body max-w-xs truncate">{m.description || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="badge-primary">{m.quantite_totale}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {m.nb_fichiers ? (
                    <span className="badge-secondary inline-flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {m.nb_fichiers}
                    </span>
                  ) : (
                    <span className="text-caption">—</span>
                  )}
                </td>
                {connecteAvecVitrine(peutGerer) && (
                  <td className="px-4 py-3">
                    {m.visible_vitrine ? (
                      <span className="badge-secondary">En vitrine</span>
                    ) : (
                      <span className="badge-neutral">Interne</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/materiels/${m.id}`}
                      title="Voir le détail"
                      className="btn-secondary px-3 py-1.5 inline-flex items-center"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {admin && (
                      <button
                        onClick={() => basculerVitrine(m)}
                        title={m.visible_vitrine ? 'Retirer de la vitrine' : 'Mettre en vitrine'}
                        className="btn-secondary px-3 py-1.5 inline-flex items-center"
                      >
                        {m.visible_vitrine ? (
                          <StarOff className="w-4 h-4" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {peutGerer && (
                      <>
                        <Link
                          to={`/materiels/${m.id}/modifier`}
                          title="Modifier"
                          className="btn-secondary px-3 py-1.5 inline-flex items-center"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => supprimer(m)}
                          title="Supprimer"
                          className="btn-danger px-3 py-1.5 inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
    
  );
}

// La colonne « Vitrine » n'a de sens que pour les utilisateurs de gestion
const connecteAvecVitrine = (peutGerer: boolean) => peutGerer;