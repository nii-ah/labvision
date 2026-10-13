import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Pencil, ExternalLink } from 'lucide-react';
import { materielService, type Materiel } from '../../services/materiel.service';
import { canManageMateriels } from '../../utils/auth';

const LIBELLES = {
  fiche_technique: 'Fiche technique',
  manuel: 'Manuel',
  autre: 'Autre',
} as const;

const formatTaille = (octets: number | null) => {
  if (!octets) return '';
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
};

export default function MaterielDetailPage() {
  const { id } = useParams();
  const [materiel, setMateriel] = useState<Materiel | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setMateriel(await materielService.getById(Number(id)));
      } catch {
        setErreur('Matériel introuvable.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-8 text-body">Chargement...</p>;

  if (erreur || !materiel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-[#DC2626]">{erreur || 'Matériel introuvable.'}</p>
        <Link to="/materiels" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/materiels" className="mb-6 inline-flex items-center gap-2 text-[#611677] font-bold">
        <ArrowLeft className="w-4 h-4" /> Retour aux matériels
      </Link>

      <div className="card">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="heading-1">{materiel.nom}</h1>
          {canManageMateriels() && (
            <Link
              to={`/materiels/${materiel.id}/modifier`}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Modifier
            </Link>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="badge-primary">Quantité : {materiel.quantite_totale}</span>
          {materiel.visible_vitrine ? (
            <span className="badge-secondary">En vitrine</span>
          ) : null}
        </div>

        <p className="text-body whitespace-pre-line">
          {materiel.description || 'Aucune description.'}
        </p>

        <h2 className="heading-2 mt-8 mb-3">Fichiers techniques</h2>
        {materiel.fichiers && materiel.fichiers.length > 0 ? (
          <ul className="space-y-2">
            {materiel.fichiers.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-sm border border-[#E5E7EB] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-bold text-bg-dark text-sm">{f.nom_original}</p>
                    <p className="text-caption">
                      {LIBELLES[f.type_fichier]} {formatTaille(f.taille) && `· ${formatTaille(f.taille)}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => materielService.openFichier(materiel.id, f.id)}
                  className="btn-secondary px-3 py-1.5 inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Ouvrir
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body">Aucun fichier technique pour ce matériel.</p>
        )}
      </div>
    </div>
  );
}