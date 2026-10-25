const pad = (n: number) => String(n).padStart(2, '0');

export const parseLocal = (s: string): Date => {
  const [d = '', t = '00:00'] = s.split('T');
  const [y = 1970, m = 1, j = 1] = d.split('-').map(Number);
  const [h = 0, min = 0] = t.split(':').map(Number);
  return new Date(y, m - 1, j, h, min);
};

// Clé "AAAA-MM-JJ" d'un jour (comparable en texte)
export const cleJour = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Clé "AAAA-MM" pour le paramètre ?mois=
export const cleMois = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

// Un événement couvre un jour s'il a lieu ce jour-là (y compris sur plusieurs jours)
export const couvreJour = (
  ev: { date_debut: string; date_fin: string | null },
  jour: Date
): boolean => {
  const k = cleJour(jour);
  const debut = ev.date_debut.slice(0, 10);
  const fin = (ev.date_fin ?? ev.date_debut).slice(0, 10);
  return debut <= k && k <= fin;
};

export const formatHeure = (s: string): string => s.slice(11, 16);

export const formatDateLongue = (s: string): string =>
  parseLocal(s).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// Valeur pour <input type="datetime-local"> : "2026-10-20T14:00"
export const versInputDate = (s: string | null): string => (s ? s.slice(0, 16) : '');

// Les 42 cases (6 semaines, semaine commençant le lundi) d'un mois
export const grilleMois = (mois: Date): Date[] => {
  const premier = new Date(mois.getFullYear(), mois.getMonth(), 1);
  const decalage = (premier.getDay() + 6) % 7;
  const debut = new Date(mois.getFullYear(), mois.getMonth(), 1 - decalage);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + i)
  );
};