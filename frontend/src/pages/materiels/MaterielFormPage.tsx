import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Upload, FileText } from 'lucide-react';
import {
  materielService,
  type MaterielFichier,
} from '../../services/materiel.service';

type TypeFichier = MaterielFichier['type_fichier'];

export default function MaterielFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const edition = !!id;
  const materielId = Number(id);

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [fichiers, setFichiers] = useState<MaterielFichier[]>([]);

  const [typeFichier, setTypeFichier] = useState<TypeFichier>('fiche_technique');
  const inputFichier = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(edition);
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string[]>>({});
  const [erreurGlobale, setErreurGlobale] = useState('');
  const [succes, setSucces] = useState('');

  const charger = async () => {
    const m = await materielService.getById(materielId);
    setNom(m.nom);
    setDescription(m.description ?? '');
    setQuantite(m.quantite_totale);
    setFichiers(m.fichiers ?? []);
  };

  useEffect(() => {
    if (!edition) return;
    (async () => {
      try {
        await charger();
      } catch {
        setErreurGlobale('Matériel introuvable.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const extraireErreurs = (err: any) => {
    const data = err?.response?.data;
    if (data?.errors) setErreurs(data.errors);
    setErreurGlobale(data?.message || 'Une erreur est survenue.');
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreurs({});
    setErreurGlobale('');
    setSucces('');
    setEnvoi(true);

    const payload = {
      nom,
      description: description.trim() || null,
      quantite_totale: quantite,
    };

    try {
      if (edition) {
        await materielService.update(materielId, payload);
        setSucces('Matériel mis à jour.');
      } else {
        const nouvelId = await materielService.create(payload);
        navigate(`/materiels/${nouvelId}/modifier`, { replace: true });
      }
    } catch (err) {
      extraireErreurs(err);
    } finally {
      setEnvoi(false);
    }
  };

  const ajouterFichier = async () => {
    const fichier = inputFichier.current?.files?.[0];
    if (!fichier) {
      setErreurGlobale('Choisissez un fichier.');
      return;
    }
    setErreurGlobale('');
    try {
      await materielService.addFichier(materielId, fichier, typeFichier);
      if (inputFichier.current) inputFichier.current.value = '';
      await charger();
    } catch (err) {
      extraireErreurs(err);
    }
  };

  const supprimerFichier = async (fichierId: number) => {
    if (!window.confirm('Supprimer ce fichier ?')) return;
    try {
      await materielService.removeFichier(materielId, fichierId);
      setFichiers((prev) => prev.filter((f) => f.id !== fichierId));
    } catch (err) {
      extraireErreurs(err);
    }
  };

  if (loading) return <p className="p-8 text-body">Chargement...</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/materiels" className="mb-6 inline-flex items-center gap-2 text-[#611677] font-bold">
        <ArrowLeft className="w-4 h-4" /> Retour aux matériels
      </Link>

      <h1 className="heading-1 mb-6">
        {edition ? 'Modifier le matériel' : 'Ajouter un matériel'}
      </h1>

      {erreurGlobale && <p className="mb-4 text-sm text-[#DC2626]">{erreurGlobale}</p>}
      {succes && <p className="mb-4 text-sm text-[#16a34a]">{succes}</p>}

      <form onSubmit={soumettre} className="card space-y-5">
        <div>
          <label className="label-ui mb-1 block" htmlFor="nom">Nom *</label>
          <input
            id="nom"
            className="input-base"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            maxLength={150}
            required
          />
          {erreurs.nom && <p className="mt-1 text-xs text-[#DC2626]">{erreurs.nom[0]}</p>}
        </div>

        <div>
          <label className="label-ui mb-1 block" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="input-base min-h-30"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {erreurs.description && (
            <p className="mt-1 text-xs text-[#DC2626]">{erreurs.description[0]}</p>
          )}
        </div>

        <div>
          <label className="label-ui mb-1 block" htmlFor="quantite">Quantité totale *</label>
          <input
            id="quantite"
            type="number"
            min={0}
            className="input-base"
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
            required
          />
          {erreurs.quantite_totale && (
            <p className="mt-1 text-xs text-[#DC2626]">{erreurs.quantite_totale[0]}</p>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={envoi}>
          {envoi ? 'Enregistrement...' : edition ? 'Enregistrer' : 'Créer le matériel'}
        </button>
      </form>

      {edition ? (
        <div className="card mt-8">
          <h2 className="heading-2 mb-4">Fichiers techniques</h2>

          {fichiers.length > 0 && (
            <ul className="mb-6 space-y-2">
              {fichiers.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-sm border border-[#E5E7EB] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-bold text-bg-dark">{f.nom_original}</span>
                    <span className="badge-neutral">{f.type_fichier.replace('_', ' ')}</span>
                  </div>
                  <button
                    onClick={() => supprimerFichier(f.id)}
                    className="btn-danger px-3 py-1.5 inline-flex items-center"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-3">
            <select
              className="input-base"
              value={typeFichier}
              onChange={(e) => setTypeFichier(e.target.value as TypeFichier)}
            >
              <option value="fiche_technique">Fiche technique</option>
              <option value="manuel">Manuel</option>
              <option value="autre">Autre</option>
            </select>
            <input
              ref={inputFichier}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="input-base"
            />
            <button
              type="button"
              onClick={ajouterFichier}
              className="btn-teal inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Ajouter le fichier
            </button>
            <p className="text-caption">PDF, JPEG, PNG ou WebP, 20 Mo maximum.</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-caption">
          Vous pourrez ajouter des fichiers techniques juste après la création.
        </p>
      )}
    </div>
  );
}