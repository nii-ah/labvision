import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/vitrine/landingPage";
import { LoginPage } from "./pages/vitrine/loginPage";
import { RegisterPage } from "./pages/vitrine/registerPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/home/homePage";
import { RessourceListPage } from "./pages/ressources/RessourceListPage";
import { RessourceDetailPage } from "./pages/ressources/RessourceDetailPage";
import { RessourceCreatePage } from "./pages/ressources/RessourceCreatePage";
import { AdhesionsAdminPage } from "./pages/admin/AdhesionsAdminPage";
import { ProjetDetailPage } from "./pages/projets/ProjetDetailPage";
import { ProjetListPage } from "./pages/projets/ProjetListPage";
import { ProjetCreatePage } from "./pages/projets/ProjetCreatePage";
import MaterielsPage from "./pages/materiels/MaterielsPage";
import MaterielFormPage from "./pages/materiels/MaterielFormPage";
import MaterielDetailPage from "./pages/materiels/MaterielDetailPage";



function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Routes protégées — à compléter au fur et à mesure */}
      <Route path="/home" element={
          <ProtectedRoute>
            <HomePage/>
          </ProtectedRoute>
        }
      />
      <Route path="/ressources" element={
            <ProtectedRoute>
                <RessourceListPage />
            </ProtectedRoute>
        } 
       />
       <Route path="/ressources/:id" element={
            <ProtectedRoute>
                <RessourceDetailPage />
            </ProtectedRoute>
        } 
       />
       <Route path="/ressources/nouvelle" element={
            <ProtectedRoute>
                <RessourceCreatePage />
            </ProtectedRoute>
        } />
        <Route path="/projets" element={
            <ProtectedRoute>
                <ProjetListPage />
            </ProtectedRoute>
        } />
        <Route path="/projets/nouveau" element={
            <ProtectedRoute><ProjetCreatePage /></ProtectedRoute>
        } />
      <Route path="/projets/:id" element={
            <ProtectedRoute><ProjetDetailPage /></ProtectedRoute>
        } />
        <Route path="/admin/adhesions" element={
            <ProtectedRoute>
                <AdhesionsAdminPage />
            </ProtectedRoute>
        } />
        <Route path="/materiels" element={<MaterielsPage />} />
        <Route path="/materiels/nouveau" element={<ProtectedRoute><MaterielFormPage /></ProtectedRoute>} />
        <Route path="/materiels/:id" element={<MaterielDetailPage />} />
        <Route path="/materiels/:id/modifier" element={<ProtectedRoute><MaterielFormPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
