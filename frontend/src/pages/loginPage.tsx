import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import logoLabVision from "../assets/icons/logo_labVision.png";


export function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    motDePasse: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Connexion:", formData);
    // Redirection vers le dashboard après connexion
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 to-sky-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-9 mb-6">
            <div className="w-20 h-20  flex items-center justify-center shadow rounded-full">
              <img src={logoLabVision} alt="FabLab LabVision" className="w-20 h-20" />
            </div>
            <div >
              <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
              <p className="text-sm text-gray-500">FabLab LabVision</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                placeholder="lab@gmail.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
              </div>
              <input
                type="password"
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center">
                <a href="#" className="text-sm text-purple-600 hover:text-purple-700">
                  Mot de passe oublié ?
                </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}