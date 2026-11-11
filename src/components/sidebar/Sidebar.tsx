import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <span className="sidebar-title">Cadastros</span>
        <NavLink
          to="/organizacoes"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          Organizações
        </NavLink>
        <NavLink
          to="/organizacao"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          Cadastrar Organização
        </NavLink>
        <NavLink
          to="/unidade"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          Unidade
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
