import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, X, MapPin, Clock, Users, Settings,
  ArrowLeft,
} from 'lucide-react';
import { evenementService, type Evenement } from '../../services/evenement.service';
import EvenementPhoto from '../../components/EvenementPhoto';
import { canManageEvenements } from '../../utils/auth';
import {
  cleJour, cleMois, couvreJour, formatDateLongue, formatHeure, grilleMois,
} from '../../utils/evenements';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];


type Selection =
  | { type: 'evenement'; evenement: Evenement }
  | { type: 'jour'; jour: Date }
  | null;

export default function CalendrierPage() {
  const [mois, setMois] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [selection, setSelection] = useState<Selection>(null);
  const MAX_PAR_CASE = 2;

  useEffect(() => {
    let annule = false;
    setLoading(true);
    setErreur('');

    const precedent = new Date(mois.getFullYear(), mois.getMonth() - 1, 1);
    const suivant = new Date(mois.getFullYear(), mois.getMonth() + 1, 1);

    Promise.all([mois, precedent, suivant].map((m) => evenementService.getAll(cleMois(m))))
      .then((listes) => {
        if (annule) return;
        const parId = new Map<number, Evenement>();
        listes.flat().forEach((e) => parId.set(e.id, e));
        setEvenements([...parId.values()]);
      })
      .catch(() => !annule && setErreur('Impossible de charger les événements.'))
      .finally(() => !annule && setLoading(false));

    return () => {
      annule = true;
    };
  }, [mois]);

  const cases = useMemo(() => grilleMois(mois), [mois]);
  const aujourdhui = cleJour(new Date());

  const evenementsDuJour = (jour: Date) =>
    evenements
      .filter((e) => couvreJour(e, jour))
      .sort((a, b) => a.date_debut.localeCompare(b.date_debut));

  const changerMois = (delta: number) =>
    setMois((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const titreMois = mois.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
  <div className="h-dvh bg-white">
    <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-10 sm:px-6">

      {/* En-tête compact */}
      <div className="mb-4 shrink-0">
        <Link
          to="/home"
          className="flex items-center gap-2 text-label text-text-secondary hover:text-primary mb-4 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="heading-1">Calendrier</h1>
            <p className="text-body mt-1 hidden sm:block">
              Ateliers, formations et rendez-vous du FabLab Lab'Vision.
            </p>
          </div>
          {canManageEvenements() && (
            <Link to="/admin/evenements" className="btn-secondary inline-flex items-center gap-2">
              <Settings className="w-4 h-4" /> Gérer les événements
            </Link>
          )}
        </div>
      </div>

      {/* Navigation du mois */}
      <div className="mb-3 flex shrink-0 items-center gap-2 sm:gap-3">
        <button onClick={() => changerMois(-1)} className="btn-secondary px-3 py-2" title="Mois précédent">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => changerMois(1)} className="btn-secondary px-3 py-2" title="Mois suivant">
          <ChevronRight className="w-4 h-4" />
        </button>
        <h2 className="heading-2 capitalize">{titreMois}</h2>
        <button
          onClick={() => {
            const n = new Date();
            setMois(new Date(n.getFullYear(), n.getMonth(), 1));
          }}
          className="btn-secondary ml-auto"
        >
          Aujourd'hui
        </button>
      </div>

      {erreur && <p className="mb-2 shrink-0 text-sm text-[#DC2626]">{erreur}</p>}

      {/* Calendrier : occupe tout l'espace restant */}
      <div
        className={`card flex min-h-0 flex-1 flex-col overflow-hidden p-0! ${
          loading ? 'opacity-60' : ''
        }`}
      >
        {/* Jours de la semaine */}
        <div className="grid shrink-0 grid-cols-7 border-b border-[#E5E7EB] bg-bg-alt">
          {JOURS.map((j) => (
            <div key={j} className="px-1 py-2 text-center label-ui">
              <span className="sm:hidden">{j.charAt(0)}</span>
              <span className="hidden sm:inline">{j}</span>
            </div>
          ))}
        </div>

        {/* 6 semaines de hauteur égale */}
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
          {cases.map((jour) => {
            const cle = cleJour(jour);
            const horsMois = jour.getMonth() !== mois.getMonth();
            const liste = evenementsDuJour(jour);
            const visibles = liste.slice(0, MAX_PAR_CASE);
            const reste = liste.length - visibles.length;

            return (
              <div
                key={cle}
                onClick={() => liste.length > 0 && setSelection({ type: 'jour', jour })}
                className={`min-h-0 min-w-0 overflow-hidden border-b border-r border-[#E5E7EB] p-1 sm:p-1.5 ${
                  horsMois ? 'bg-bg-alt' : 'bg-white'
                } ${liste.length > 0 ? 'cursor-pointer' : ''}`}
              >
                <div className="mb-0.5 flex justify-end">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold sm:h-6 sm:w-6 sm:text-xs ${
                      cle === aujourdhui
                        ? 'bg-border-focus text-white'
                        : horsMois
                        ? 'text-[#7a969f]'
                        : 'text-[#2a2a2a]'
                    }`}
                  >
                    {jour.getDate()}
                  </span>
                </div>

                {/* Mobile : points */}
                {liste.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5 sm:hidden">
                    {liste.slice(0, 4).map((e) => (
                      <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-border-focus" />
                    ))}
                  </div>
                )}

                {/* Tablette / ordinateur : titres */}
                <div className="hidden space-y-0.5 sm:block">
                  {visibles.map((e) => (
                    <button
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelection({ type: 'evenement', evenement: e });
                      }}
                      title={e.titre}
                      className="block w-full truncate rounded-xs bg-border-focus/10 px-1.5 py-0.5 text-left text-xs font-bold text-border-focus hover:bg-border-focus/20"
                    >
                      {e.titre}
                    </button>
                  ))}
                  {reste > 0 && (
                    <span className="block truncate px-1 text-xs font-bold text-[#27a49b]">
                      +{reste} autre{reste > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!loading && evenements.length === 0 && !erreur && (
        <p className="mt-2 shrink-0 text-body">Aucun événement prévu autour de ce mois.</p>
      )}

      {selection && (
        <Modal onClose={() => setSelection(null)}>
          {selection.type === 'evenement' ? (
            <DetailEvenement evenement={selection.evenement} />
          ) : (
            <ListeDuJour
              jour={selection.jour}
              evenements={evenementsDuJour(selection.jour)}
              onChoisir={(e) => setSelection({ type: 'evenement', evenement: e })}
            />
          )}
        </Modal>
      )}
    </div>
  </div>
);
}

/* ---------- Sous-composants ---------- */

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 hover:bg-bg-alt"
          title="Fermer"
        >
          <X className="w-5 h-5 text-[#2a2a2a]" />
        </button>
        {children}
      </div>
    </div>
  );
}

function DetailEvenement({ evenement: e }: { evenement: Evenement }) {
  const memeJour = !e.date_fin || e.date_fin.slice(0, 10) === e.date_debut.slice(0, 10);

  return (
    <div>
      {e.a_photo ? (
        <EvenementPhoto id={e.id} alt={e.titre} className="h-48 w-full rounded-t-[16px]" />
      ) : null}

      <div className="p-6">
        <h2 className="heading-2 mb-4">{e.titre}</h2>

        <ul className="mb-4 space-y-2 text-sm text-[#2a2a2a]">
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 w-4 h-4 shrink-0 text-border-focus" />
            <span className="capitalize">
              {formatDateLongue(e.date_debut)}, {formatHeure(e.date_debut)}
              {e.date_fin &&
                (memeJour
                  ? ` – ${formatHeure(e.date_fin)}`
                  : ` → ${formatDateLongue(e.date_fin)}, ${formatHeure(e.date_fin)}`)}
            </span>
          </li>
          {e.lieu && (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 w-4 h-4 shrink-0 text-border-focus" />
              <span>{e.lieu}</span>
            </li>
          )}
          {e.partenaires && (
            <li className="flex items-start gap-2">
              <Users className="mt-0.5 w-4 h-4 shrink-0 text-border-focus" />
              <span>{e.partenaires}</span>
            </li>
          )}
        </ul>

        <p className="text-body whitespace-pre-line">{e.description}</p>
      </div>
    </div>
  );
}

function ListeDuJour({
  jour, evenements, onChoisir,
}: {
  jour: Date;
  evenements: Evenement[];
  onChoisir: (e: Evenement) => void;
}) {
  return (
    <div className="p-6">
      <h2 className="heading-2 mb-4 pr-8 capitalize">
        {jour.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </h2>
      <ul className="space-y-2">
        {evenements.map((e) => (
          <li key={e.id}>
            <button
              onClick={() => onChoisir(e)}
              className="flex w-full items-center justify-between rounded-sm border border-[#E5E7EB] px-4 py-3 text-left hover:bg-bg-alt"
            >
              <span className="font-bold text-[#2a2a2a]">{e.titre}</span>
              <span className="badge-primary">{formatHeure(e.date_debut)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}