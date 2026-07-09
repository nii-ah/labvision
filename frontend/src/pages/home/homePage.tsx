import logoLabVision from "../assets/icons/logo_labVision.png";
import { Mail, MapPin, } from "lucide-react";

const partenaires = [
  { id: 1, sigle: "ESP", nom: "École Polytechnique d'Antsiranana", couleur: "bg-blue-100 text-blue-800" },
  { id: 2, sigle: "UNA", nom: "Université d'Antsiranana", couleur: "bg-green-100 text-green-800" },
  { id: 3, sigle: "DA", nom: "Diasporeines Africa", couleur: "bg-purple-100 text-purple-800" },
];

export function HomePage () {
    
    return (
       <div>
        <div>
            Header
        </div>

        <div>
            body
        </div>

         {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
        <footer className="bg-gray-900 text-white py-10 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* [RESPONSIVE] 1 col mobile → 3 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">

                {/* Présentation */}
                <div>
                <div className="flex items-center gap-3 mb-4">
                    <img src={logoLabVision} alt="logoLabVision" className="w-12 h-12 object-contain" />
                    <span className="font-semibold">FabLab Lab'Vision</span>
                </div>
                <p className="text-sm text-gray-400">Laboratoire d'innovation collaborative pour la création de projets technologiques durables.</p>
                </div>

                {/* Contact */}
                <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0" />
                    contact@labvision.mg
                    </li>
                    <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    ESP, Antsiranana, Madagascar
                    </li>
                </ul>
                </div>

                {/* Partenaires */}
                <div>
                <h4 className="font-semibold mb-4">partenaires</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                    {partenaires.map((p) => (
                    <li key={p.id}>{p.nom}</li>
                    ))}
                </ul>
                </div>

            </div>

          <div className="pt-6 sm:pt-8 border-t border-gray-800 text-center text-xs sm:text-sm text-gray-400">
            <p>© 2026 FabLab Lab'Vision — ESP Antsiranana. Tous droits réservés.</p>
          </div>
            </div>
      </footer>
       </div>
    )
}