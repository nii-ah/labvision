import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import { LoginPage } from "./pages/loginPage";
import { RegisterPage } from "./pages/registerPage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
  );
}

export default App;