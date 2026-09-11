// src/pages/admin/AdhesionsAdminPage.tsx
import { useEffect, useState } from "react";
import { Check, Clock } from "lucide-react";
import { getAdhesionsEnAttente, validerAdhesion, type Adhesion } from "../../services/adhesion.service";
import { isAdmin } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

export function AdhesionsAdminPage() {
  const navigate = useNavigate();
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const charger = () => {
    setLoading(true);
    getAdhesionsEnAttente()
      .then(setAdhesions)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/home");
      return;
    }
    charger();
  }, [navigate]);

  const handleValider = async (id: number) => {
    setProcessingId(id);
    try {
      await validerAdhesion(id);
      setAdhesions((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        <h1 className="heading-1 mb-2">Demandes d'adhésion</h1>
        <p className="text-body mb-8">Membres en attente de validation.</p>

        {loading && <p className="text-body-sm">Chargement...</p>}

        {!loading && adhesions.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-body">Aucune demande en attente.</p>
          </div>
        )}

        <div className="space-y-3">
          {adhesions.map((a) => (
            <div key={a.id} className="card flex items-center justify-between">
              <div>
                <p className="text-label">{a.prenom} {a.nom}</p>
                <p className="text-caption">{a.email}</p>
                <p className="text-caption flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Demandé le {new Date(a.date_demande).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleValider(a.id)}
                disabled={processingId === a.id}
                className="btn-primary-sm"
              >
                <Check className="w-4 h-4" />
                {processingId === a.id ? "..." : "Valider"}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}