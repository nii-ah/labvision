import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import logoLabVision from "../assets/icons/logo_labVision.png";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    confirmMotDePasse: "",
    etablissement: "",
    niveauEtude: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Inscription:", formData);
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inscription</h1>
              <p className="text-sm text-gray-500">FabLab LabVision</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                  placeholder="prénom"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                  placeholder="nom"
                  required
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Établissement
              </label>
              <input
                type="text"
                value={formData.etablissement}
                onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                placeholder="Établissement"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Niveau d'étude
              </label>
              <select
                value={formData.niveauEtude}
                onChange={(e) => setFormData({ ...formData, niveauEtude: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un niveau</option>
                <option value="licence1">Licence 1</option>
                <option value="licence2">Licence 2</option>
                <option value="licence3">Licence 3</option>
                <option value="master1">Master 1</option>
                <option value="master2">Master 2</option>
                <option value="doctorat">Doctorat</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={formData.confirmMotDePasse}
                onChange={(e) => setFormData({ ...formData, confirmMotDePasse: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
            >
              Créer mon compte
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
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