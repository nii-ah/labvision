import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import { LoginPage } from "./pages/loginPage";
import { RegisterPage } from "./pages/registerPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Routes protégées — à compléter au fur et à mesure */}
        <Route path="/dashboard" element={
            <ProtectedRoute>
                <div>Dashboard (page à créer)</div>
            </ProtectedRoute>
        } />
      </Routes>
  );
}

export default App;