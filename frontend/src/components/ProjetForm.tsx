import { useState, useEffect } from 'react';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';

interface Domaine {
  id: number;
  nom: string;
}

export default function ProjetForm({ onSuccess }: { onSuccess?: () => void }) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [domaineIds, setDomaineIds] = useState<number[]>([]);
  const [couverture, setCouverture] = useState<File | null>(null);
  const [couverturePreview, setCouverturePreview] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobale, setErreurGlobale] = useState('');

    useEffect(() => {
    api.get('/domaines')
        .then((res) => setDomaines(res.data.domaines || res.data))
        .catch(() => setDomaines([]));
    }, []);

  const toggleDomaine = (id: number) => {
    setDomaineIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleCouverture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCouverture(file);
    setCouverturePreview(URL.createObjectURL(file));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErreurs({});
  setErreurGlobale('');

  if (!couverture) {
    setErreurGlobale("Une image de couverture est requise.");
    return;
  }
  if (domaineIds.length === 0) {
    setErreurs({ domaine_ids: 'Sélectionnez au moins un domaine.' });
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('domaine_ids', JSON.stringify(domaineIds));
    formData.append('image_couverture', couverture);
    images.forEach((img) => formData.append('images', img));

    await api.post('/projets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setTitre('');
    setDescription('');
    setDomaineIds([]);
    setCouverture(null);
    setCouverturePreview(null);
    setImages([]);
    onSuccess?.();
  } catch (err: any) {
    console.error('Erreur création projet:', err);
    if (err.response?.data?.errors) {
      setErreurs(err.response.data.errors);
    } else {
      setErreurGlobale(err.response?.data?.message || 'Erreur lors de la publication.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto flex flex-col gap-6">
      <h2 className="heading-2">Publier un projet</h2>

      {erreurGlobale && (
        <div className="badge-danger w-fit">{erreurGlobale}</div>
      )}

      {/* Titre */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Titre du projet</label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="input-base"
          style={erreurs.titre ? { borderColor: 'var(--color-border-error)', borderWidth: 2 } : {}}
          placeholder="Ex : Système d'irrigation solaire"
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
          placeholder="Décrivez le projet, son objectif, son fonctionnement..."
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
        {erreurs.domaine_ids && <span className="text-caption" style={{ color: 'var(--color-error)' }}>{erreurs.domaine_ids}</span>}
      </div>

      {/* Image de couverture */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Image de couverture</label>
        {couverturePreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
            <img src={couverturePreview} alt="Couverture" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setCouverture(null); setCouverturePreview(null); }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
            >
              <X className="w-4 h-4" style={{ color: 'var(--color-error)' }} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 h-40 border-2 border-dashed rounded-lg cursor-pointer"
                 style={{ borderColor: 'var(--color-neutral)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-alt)' }}>
            <Upload className="w-6 h-6" style={{ color: 'var(--color-neutral)' }} />
            <span className="text-body-sm">Cliquez pour choisir une image</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCouverture} />
          </label>
        )}
      </div>

      {/* Galerie */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Galerie (jusqu'à 5 images)</label>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
              <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5"
              >
                <X className="w-3 h-3" style={{ color: 'var(--color-error)' }} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer"
                   style={{ borderColor: 'var(--color-neutral)', borderRadius: 'var(--radius-sm)' }}>
              <ImagePlus className="w-5 h-5" style={{ color: 'var(--color-neutral)' }} />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            </label>
          )}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary-lg justify-center">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Publication...' : 'Publier le projet'}
      </button>
    </form>
  );
}