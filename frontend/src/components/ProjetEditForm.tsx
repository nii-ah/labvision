import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';

interface Domaine {
  id: number;
  nom: string;
}

interface ProjetExistant {
  id: number;
  titre: string;
  description: string;
  image_couverture: string;
  domaines: { id: number; nom: string }[];
  images: { id: number; fichier_url: string }[];
}

export default function ProjetEditForm({ projetId }: { projetId: number }) {
  const navigate = useNavigate();

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [domaineIds, setDomaineIds] = useState<number[]>([]);

  // Couverture : soit l'ancienne (URL), soit une nouvelle (File)
  const [couvertureActuelle, setCouvertureActuelle] = useState<string | null>(null);
  const [nouvelleCouverture, setNouvelleCouverture] = useState<File | null>(null);
  const [couverturePreview, setCouverturePreview] = useState<string | null>(null);

  // Galerie : si l'utilisateur ajoute de nouvelles images, elles remplacent tout (comme le backend)
  const [nouvellesImages, setNouvellesImages] = useState<File[]>([]);
  const [galerieActuelle, setGalerieActuelle] = useState<{ id: number; fichier_url: string }[]>([]);
  const [remplacerGalerie, setRemplacerGalerie] = useState(false);

  const [chargementInitial, setChargementInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobale, setErreurGlobale] = useState('');

  useEffect(() => {
    fetch('/api/domaines', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setDomaines(data.domaines || data))
      .catch(() => setDomaines([]));
  }, []);

  useEffect(() => {
    fetch(`/api/projets/${projetId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data: ProjetExistant) => {
        setTitre(data.titre);
        setDescription(data.description || '');
        setDomaineIds(data.domaines.map((d) => d.id));
        setCouvertureActuelle(data.image_couverture);
        setGalerieActuelle(data.images || []);
      })
      .finally(() => setChargementInitial(false));
  }, [projetId]);

  const toggleDomaine = (id: number) => {
    setDomaineIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleCouverture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNouvelleCouverture(file);
    setCouverturePreview(URL.createObjectURL(file));
  };

  const handleNouvellesImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setRemplacerGalerie(true);
    setNouvellesImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeNouvelleImage = (index: number) => {
    setNouvellesImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurs({});
    setErreurGlobale('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('description', description);
      formData.append('domaine_ids', JSON.stringify(domaineIds));
      if (nouvelleCouverture) formData.append('image_couverture', nouvelleCouverture);
      if (remplacerGalerie) {
        nouvellesImages.forEach((img) => formData.append('images', img));
      }

      const res = await fetch(`/api/projets/${projetId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErreurs(data.errors);
        else setErreurGlobale(data.message || 'Erreur lors de la modification.');
        return;
      }

      navigate(`/projets/${projetId}`);
    } catch {
      setErreurGlobale('Erreur réseau, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (chargementInitial) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto flex flex-col gap-6">
      <h2 className="heading-2">Modifier le projet</h2>

      {erreurGlobale && <div className="badge-danger w-fit">{erreurGlobale}</div>}

      {/* Titre */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Titre du projet</label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="input-base"
          style={erreurs.titre ? { borderColor: 'var(--color-border-error)', borderWidth: 2 } : {}}
          required
        />
        {erreurs.titre && <span className="text-caption" style={{ color: 'var(--color-error)' }}>{erreurs.titre}</span>}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-base"
          rows={5}
        />
      </div>

      {/* Domaines */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Domaines</label>
        <div className="flex flex-wrap gap-2">
          {domaines.map((d) => {
            const actif = domaineIds.includes(d.id);
            return (
              <button
                type="button"
                key={d.id}
                onClick={() => toggleDomaine(d.id)}
                className={actif ? 'badge-primary' : 'badge-neutral'}
              >
                {d.nom}
              </button>
            );
          })}
        </div>
      </div>

      {/* Couverture actuelle / nouvelle */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Image de couverture</label>
        <div className="relative w-full h-48 overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
          <img
            src={couverturePreview || `/uploads/${couvertureActuelle}`}
            alt="Couverture"
            className="w-full h-full object-cover"
          />
          <label className="absolute bottom-2 right-2 btn-secondary-sm cursor-pointer" style={{ backgroundColor: 'white' }}>
            <Upload className="w-4 h-4" /> Changer
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCouverture} />
          </label>
        </div>
      </div>

      {/* Galerie */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Galerie</label>

        {!remplacerGalerie ? (
          <>
            <div className="flex flex-wrap gap-3">
              {galerieActuelle.map((img) => (
                <div key={img.id} className="w-20 h-20 overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <img src={`/uploads/${img.fichier_url}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <label className="text-caption cursor-pointer underline" style={{ color: 'var(--color-primary)' }}>
              Remplacer toute la galerie
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleNouvellesImages} />
            </label>
          </>
        ) : (
          <>
            <span className="text-caption" style={{ color: 'var(--color-secondary-dark)' }}>
              La galerie actuelle sera remplacée par ces images à l'enregistrement.
            </span>
            <div className="flex flex-wrap gap-3">
              {nouvellesImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20 overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNouvelleImage(i)}
                    className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" style={{ color: 'var(--color-error)' }} />
                  </button>
                </div>
              ))}
              {nouvellesImages.length < 5 && (
                <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed cursor-pointer"
                       style={{ borderColor: 'var(--color-neutral)', borderRadius: 'var(--radius-sm)' }}>
                  <ImagePlus className="w-5 h-5" style={{ color: 'var(--color-neutral)' }} />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleNouvellesImages} />
                </label>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setRemplacerGalerie(false); setNouvellesImages([]); }}
              className="text-caption underline w-fit"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Annuler, garder la galerie actuelle
            </button>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-2">
        <button type="submit" disabled={loading} className="btn-primary-lg flex-1 justify-center">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
        <button type="button" onClick={() => navigate(`/projets/${projetId}`)} className="btn-secondary">
          Annuler
        </button>
      </div>
    </form>
  );
}