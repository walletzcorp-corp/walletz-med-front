//componente pai/principal

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import HeaderSite from "./components/header/Header";
import Sidebar from "./components/sidebar/Sidebar";
import OrganizationPage from "./pages/OrganizationRegisterPage";
import UnitPage from "./pages/UnitPage";
import OrganizationListPage from "./pages/OrganizationListPage";

function App() {
  return (
    <BrowserRouter>
      {/* Cabeçalho com logo */}
      <HeaderSite />

      {/* Área abaixo do header: sidebar + conteúdo */}
      <div className="app-body">
        {/* Coluna lateral de navegação */}
        <Sidebar />

        {/* Conteúdo da página atual */}
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/organizacoes" replace />} />
            <Route path="/organizacoes" element={<OrganizationListPage />} />
            <Route path="/organizacao" element={<OrganizationPage />} />
            <Route path="/unidade" element={<UnitPage />} />
            <Route path="*" element={<Navigate to="/organizacoes" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
