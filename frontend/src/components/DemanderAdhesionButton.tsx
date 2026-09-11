// src/components/DemanderAdhesionButton.tsx
import { useEffect, useState } from "react";
import { UserPlus, Clock } from "lucide-react";
import { demanderAdhesion, getMonAdhesion } from "../services/adhesion.service";

export function DemanderAdhesionButton() {
  const [etat, setEtat] = useState<"chargement" | "aucune" | "en_attente" | "validee" | "envoi">("chargement");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMonAdhesion()
      .then((adhesion) => {
        if (!adhesion) setEtat("aucune");
        else if (adhesion.validee) setEtat("validee");
        else setEtat("en_attente");
      })
      .catch(() => setEtat("aucune"));
  }, []);

  const handleClick = async () => {
    setEtat("envoi");
    try {
      await demanderAdhesion();
      setEtat("en_attente");
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
      setEtat("aucune");
    }
  };

  if (etat === "chargement") return null;

  if (etat === "validee") {
    return (
      <div className="w-8 h-8 rounded-full bg-(--color-primary) flex items-center justify-center text-white text-sm font-bold shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-user-round-group"><path d="M17 21a5 5 0 00-10 0"/><path d="M22 10.5a3.5 3.5 0 00-5.507-2.868"/><path d="M7.507 7.632A3.5 3.5 0 002 10.5"/><circle cx="12" cy="13" r="3"/><circle cx="18.5" cy="4.5" r="2.5"/><circle cx="5.5" cy="4.5" r="2.5"/></svg>
      </div>
    );
  }

  if (etat === "en_attente") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-label border border-border text-text-secondary hover:text-(--color-primary) hover:bg-bg-alt rounded-sm transition">
        <Clock className="w-5 h-5" style={{ color: "var(--color-neutral)" }} />
        <p className="text-body-sm">Demande en cours </p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleClick} disabled={etat === "envoi"} className="flex items-center gap-2 px-3 py-2 text-label border border-border text-text-secondary hover:text-(--color-primary) hover:bg-bg-alt rounded-sm transition">
        <UserPlus className="w-4 h-4" />
        {etat === "envoi" ? "Envoi..." : "Demander l'adhésion"}
      </button>
      {error && (
        <p className="text-caption mt-2" style={{ color: "var(--color-error)" }}>{error}</p>
      )}
    </div>
  );
}