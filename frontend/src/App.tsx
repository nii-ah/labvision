import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/vitrine/landingPage";
import { LoginPage } from "./pages/vitrine/loginPage";
import { RegisterPage } from "./pages/vitrine/registerPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/home/homePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Routes protégées — à compléter au fur et à mesure */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomePage/>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
