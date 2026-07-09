import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {  ArrowLeft, Eye, EyeOff } from "lucide-react";
import logoLabVision from "../../assets/icons/logo_labVision.png";
import { registerUser } from "../../services/auth.service";

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    confirmMotDePasse: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation front : les deux mots de passe doivent correspondre
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        mot_de_passe: formData.motDePasse,
      });
      console.log("Inscription réussi.");
      navigate("/login");
    } catch (err: any) {
    const data = err.response?.data;

    if (data?.errors) {
        // Regroupe tous les messages d'erreur de chaque champ en une seule liste
        const allMessages = Object.values(data.errors).flat() as string[];
        setError(allMessages.join(" "));
    } else {
        setError(data?.message || "Une erreur est survenue. Veuillez réessayer.");
    }
    } finally {
    setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoLabVision} alt="FabLab LabVision" className="w-12 h-12" />
            <div>
                <h1 className="text-2xl font-black tracking-tight">
                    <span className="text-gray-900">Rejoignez</span>{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-purple-600">
                    Lab'Vision
                    </span>
                </h1>
              <p className="text-xs text-gray-500">FabLab LabVision</p>
            </div>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                  placeholder="nom"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                  placeholder="prénom"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Adresse email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                placeholder="lab@gmail.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe</label>
                    <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={formData.motDePasse}
                        onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                        className="w-full px-3 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirmer</label>
                    <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmMotDePasse}
                        onChange={(e) => setFormData({ ...formData, confirmMotDePasse: e.target.value })}
                        className="w-full px-3 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    </div>
                </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
                8 caractères minimum, 1 majuscule, 1 chiffre, 1 caractère spécial
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}