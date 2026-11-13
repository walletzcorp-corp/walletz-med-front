import { Fragment, useEffect, useState } from "react";
import "./OrganizationList.css";
import type { Organization } from "../../../models/organization";
import { OrganizationService } from "../../../services/OrganizationService";
import { Link } from "react-router-dom";
import OrganizationDetail from "../organization-detail/OrganizationDetail";

const taxProfileLabels: Record<string, string> = {
  SIMPLES_NACIONAL: "Simples Nacional",
  LUCRO_PRESUMIDO: "Lucro Presumido",
  LUCRO_REAL: "Lucro Real",
  MEI: "MEI",
};

function formatCnpj(value: string) {
  return value.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, "$1.$2.$3/$4-$5");
}

function OrganizationList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // id da organização com o painel aberto (null = nenhuma)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((current) => (current === id ? null : id));


  useEffect(() => {
    OrganizationService.getOrganizations()
      .then(setOrganizations)
      .catch(() => setError("Erro ao carregar organizações"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="organization-list">
      <h2>Organizações</h2>

      <Link to="/organizacao" className="btn-primary">
        + Nova organização
      </Link>

      {loading && <p className="state-message">Carregando...</p>}
      {error && <p className="state-message error">{error}</p>}
      {!loading && !error && organizations.length === 0 && (
        <p className="state-message">Nenhuma organização cadastrada.</p>
      )}

      {!loading && !error && organizations.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Razão social</th>
                <th>Nome fantasia</th>
                <th>CNPJ</th>
                <th>Perfil tributário</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((organization) => {
                const isOpen = expandedId === organization.id;

                return (
                  <Fragment key={organization.id}>
                    <tr className={isOpen ? "row-open" : ""}>
                      <td>
                        <button
                          className="btn-expand"
                          aria-expanded={isOpen}
                          aria-label={
                            isOpen ? "Recolher unidades" : "Ver unidades"
                          }
                          onClick={() => toggle(organization.id)}
                        >
                          {isOpen ? "▾" : "▸"}
                        </button>
                      </td>
                      <td className="cell-main">{organization.legalName}</td>
                      <td>{organization.tradeName}</td>
                      <td className="cell-cnpj">
                        {formatCnpj(organization.cnpjDigits)}
                      </td>
                      <td>
                        <span className="badge">
                          {taxProfileLabels[organization.taxProfile] ??
                            organization.taxProfile}
                        </span>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="row-detail">
                        <td colSpan={5}>
                          <OrganizationDetail organization={organization} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrganizationList;
