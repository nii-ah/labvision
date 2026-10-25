import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Star, StarOff, X, Save, ArrowLeft,
} from 'lucide-react';
import { evenementService, type Evenement } from '../../services/evenement.service';
import EvenementPhoto from '../../components/EvenementPhoto';
import { canManageEvenements, isAdmin } from '../../utils/auth';
import { formatHeure, parseLocal, versInputDate } from '../../utils/evenements';

const VIDE = {
  titre: '',
  description: '',
  date_debut: '',
  date_fin: '',
  lieu: '',
  partenaires: '',
};

export default function EvenementsAdminPage() {
  const admin = isAdmin();

  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreurGlobale, setErreurGlobale] = useState('');
  const [succes, setSucces] = useState('');

  // Formulaire : null = fermé, 'nouveau' = création, nombre = id en modification
  const [formulaire, setFormulaire] = useState<null | 'nouveau' | number>(null);
  const [champs, setChamps] = useState(VIDE);
  const [aPhoto, setAPhoto] = useState(false);
  const [supprimerPhoto, setSupprimerPhoto] = useState(false);
  const [versionPhoto, setVersionPhoto] = useState(0);
  const [erreurs, setErreurs] = useState<Record<string, string[]>>({});
  const [envoi, setEnvoi] = useState(false);
  const inputPhoto = useRef<HTMLInputElement>(null);

  const charger = async () => {
    try {
      setEvenements(await evenementService.getAll());
    } catch {
      setErreurGlobale('Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  if (!canManageEvenements()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-[#DC2626]">Vous n'avez pas accès à cette page.</p>
        <Link to="/evenements" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour au calendrier
        </Link>
      </div>
    );
  }

  const ouvrirCreation = () => {
    setChamps(VIDE);
    setAPhoto(false);
    setSupprimerPhoto(false);
    setErreurs({});
    setErreurGlobale('');
    setSucces('');
    setFormulaire('nouveau');
    if (inputPhoto.current) inputPhoto.current.value = '';
  };

  const ouvrirEdition = (e: Evenement) => {
    setChamps({
      titre: e.titre,
      description: e.description,
      date_debut: versInputDate(e.date_debut),
      date_fin: versInputDate(e.date_fin),
      lieu: e.lieu ?? '',
      partenaires: e.partenaires ?? '',
    });
    setAPhoto(!!e.a_photo);
    setSupprimerPhoto(false);
    setErreurs({});
    setErreurGlobale('');
    setSucces('');
    setFormulaire(e.id);
    if (inputPhoto.current) inputPhoto.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fermer = () => setFormulaire(null);

  const maj = (nom: keyof typeof VIDE, valeur: string) =>
    setChamps((c) => ({ ...c, [nom]: valeur }));

  const soumettre = async (ev: FormEvent) => {
    ev.preventDefault();
    setErreurs({});
    setErreurGlobale('');
    setSucces('');
    setEnvoi(true);

    const input = {
      ...champs,
      photo: inputPhoto.current?.files?.[0] ?? null,
      supprimer_photo: supprimerPhoto,
    };

    try {
      if (formulaire === 'nouveau') {
        await evenementService.create(input);
        setSucces('Événement créé.');
      } else if (typeof formulaire === 'number') {
        await evenementService.update(formulaire, input);
        setSucces('Événement mis à jour.');
        setVersionPhoto((v) => v + 1);
      }
      await charger();
      fermer();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors) setErreurs(data.errors);
      setErreurGlobale(data?.message || 'Une erreur est survenue.');
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async (e: Evenement) => {
    if (!window.confirm(`Supprimer « ${e.titre} » ?`)) return;
    try {
      await evenementService.remove(e.id);
      setEvenements((prev) => prev.filter((x) => x.id !== e.id));
      if (formulaire === e.id) fermer();
      setSucces('Événement supprimé.');
    } catch {
      setErreurGlobale('La suppression a échoué.');
    }
  };

  const basculerVitrine = async (e: Evenement) => {
    const valeur = !e.visible_vitrine;
    try {
      await evenementService.setVitrine(e.id, valeur);
      setEvenements((prev) =>
        prev.map((x) => (x.id === e.id ? { ...x, visible_vitrine: valeur } : x))
      );
    } catch {
      setErreurGlobale('Impossible de modifier la visibilité.');
    }
  };

  const formatDate = (e: Evenement) => {
    const d = parseLocal(e.date_debut).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    return `${d} · ${formatHeure(e.date_debut)}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/evenements" className="mb-6 inline-flex items-center gap-2 font-bold text-border-focus">
        <ArrowLeft className="w-4 h-4" /> Retour au calendrier
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-1">Gestion des événements</h1>
          <p className="text-body">Créez, modifiez et publiez les événements du FabLab.</p>
        </div>
        {formulaire === null && (
          <button onClick={ouvrirCreation} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvel événement
          </button>
        )}
      </div>

      {erreurGlobale && <p className="mb-4 text-sm text-[#DC2626]">{erreurGlobale}</p>}
      {succes && <p className="mb-4 text-sm text-[#16a34a]">{succes}</p>}

      {/* Formulaire */}
      {formulaire !== null && (
        <form onSubmit={soumettre} className="card mb-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="heading-2">
              {formulaire === 'nouveau' ? 'Nouvel événement' : "Modifier l'événement"}
            </h2>
            <button type="button" onClick={fermer} className="btn-secondary px-3! py-1.5!" title="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="label-ui mb-1 block" htmlFor="titre">Titre *</label>
            <input
              id="titre"
              className="input-base"
              value={champs.titre}
              onChange={(e) => maj('titre', e.target.value)}
              maxLength={200}
              required
            />
            {erreurs.titre && <p className="mt-1 text-xs text-[#DC2626]">{erreurs.titre[0]}</p>}
          </div>

          <div>
            <label className="label-ui mb-1 block" htmlFor="description">Description *</label>
            <textarea
              id="description"
              className="input-base min-h-30"
              value={champs.description}
              onChange={(e) => maj('description', e.target.value)}
              required
            />
            {erreurs.description && (
              <p className="mt-1 text-xs text-[#DC2626]">{erreurs.description[0]}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-ui mb-1 block" htmlFor="debut">Début *</label>
              <input
                id="debut"
                type="datetime-local"
                className="input-base"
                value={champs.date_debut}
                onChange={(e) => maj('date_debut', e.target.value)}
                required
              />
              {erreurs.date_debut && (
                <p className="mt-1 text-xs text-[#DC2626]">{erreurs.date_debut[0]}</p>
              )}
            </div>
            <div>
              <label className="label-ui mb-1 block" htmlFor="fin">Fin (optionnelle)</label>
              <input
                id="fin"
                type="datetime-local"
                className="input-base"
                value={champs.date_fin}
                min={champs.date_debut || undefined}
                onChange={(e) => maj('date_fin', e.target.value)}
              />
              {erreurs.date_fin && (
                <p className="mt-1 text-xs text-[#DC2626]">{erreurs.date_fin[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-ui mb-1 block" htmlFor="lieu">Lieu</label>
              <input
                id="lieu"
                className="input-base"
                value={champs.lieu}
                onChange={(e) => maj('lieu', e.target.value)}
                maxLength={255}
              />
              {erreurs.lieu && <p className="mt-1 text-xs text-[#DC2626]">{erreurs.lieu[0]}</p>}
            </div>
            <div>
              <label className="label-ui mb-1 block" htmlFor="partenaires">Partenaires</label>
              <input
                id="partenaires"
                className="input-base"
                value={champs.partenaires}
                onChange={(e) => maj('partenaires', e.target.value)}
                maxLength={500}
                placeholder="Séparés par des virgules"
              />
              {erreurs.partenaires && (
                <p className="mt-1 text-xs text-[#DC2626]">{erreurs.partenaires[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label-ui mb-1 block" htmlFor="photo">Photo (optionnelle)</label>
            {typeof formulaire === 'number' && aPhoto && !supprimerPhoto && (
              <div className="mb-3 flex items-center gap-4">
                <EvenementPhoto
                  id={formulaire}
                  alt="Photo actuelle"
                  version={versionPhoto}
                  className="h-20 w-32 rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => setSupprimerPhoto(true)}
                  className="btn-danger px-3! py-1.5! inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Retirer la photo
                </button>
              </div>
            )}
            {supprimerPhoto && (
              <p className="mb-2 text-xs text-[#6b7280]">
                La photo sera supprimée à l'enregistrement.{' '}
                <button
                  type="button"
                  className="font-bold text-border-focus"
                  onClick={() => setSupprimerPhoto(false)}
                >
                  Annuler
                </button>
              </p>
            )}
            <input
              id="photo"
              ref={inputPhoto}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="input-base"
            />
            <p className="mt-1 text-caption">
              JPEG, PNG ou WebP, 5 Mo maximum.
              {typeof formulaire === 'number' && aPhoto && ' Choisir un fichier remplace la photo actuelle.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={envoi}>
              <Save className="w-4 h-4" />
              {envoi ? 'Enregistrement...' : formulaire === 'nouveau' ? "Créer l'événement" : 'Enregistrer'}
            </button>
            <button type="button" onClick={fermer} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {/* Tableau */}
      <div className="card overflow-x-auto p-0!">
        <table className="w-full text-left">
          <thead className="border-b border-[#E5E7EB] bg-bg-alt">
            <tr>
              <th className="px-4 py-3 label-ui">Titre</th>
              <th className="px-4 py-3 label-ui">Date</th>
              <th className="px-4 py-3 label-ui">Lieu</th>
              <th className="px-4 py-3 label-ui">Vitrine</th>
              <th className="px-4 py-3 label-ui text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-body">Chargement...</td>
              </tr>
            )}
            {!loading && evenements.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-body">
                  Aucun événement. Créez le premier avec « Nouvel événement ».
                </td>
              </tr>
            )}
            {evenements.map((e) => (
              <tr key={e.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-bg-alt">
                <td className="px-4 py-3 font-bold text-[#2a2a2a]">{e.titre}</td>
                <td className="px-4 py-3 text-body whitespace-nowrap">{formatDate(e)}</td>
                <td className="px-4 py-3 text-body">{e.lieu || '—'}</td>
                <td className="px-4 py-3">
                  {e.visible_vitrine ? (
                    <span className="badge-secondary">En vitrine</span>
                  ) : (
                    <span className="badge-neutral">Interne</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {admin && (
                      <button
                        onClick={() => basculerVitrine(e)}
                        title={e.visible_vitrine ? 'Retirer de la vitrine' : 'Mettre en vitrine'}
                        className="btn-secondary px-3! py-1.5! inline-flex items-center"
                      >
                        {e.visible_vitrine ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => ouvrirEdition(e)}
                      title="Modifier"
                      className="btn-secondary px-3! py-1.5! inline-flex items-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => supprimer(e)}
                      title="Supprimer"
                      className="btn-danger px-3! py-1.5! inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}