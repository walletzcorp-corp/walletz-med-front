import { Fragment, useEffect, useState } from "react";
import { Unit, UnitStatus } from "../../../models/unit";
import { UnitService } from "../../../services/UnitService";
import { ApiError } from "../../../services/ApiError";
import UnitRegister from "../../unit/unit-register/UnitRegister";

const statusLabels: Record<UnitStatus, string> = {
    RASCUNHO: "Rascunho",
    ATIVA: "Ativa",
    BLOQUEADA: "Bloqueada",
    INATIVA: "Inativa",
};

const canActivate = (unit: Unit) =>
  unit.status === "RASCUNHO" || unit.status === "BLOQUEADA";

interface Props {
  organizationId: string;
  canCreate: boolean;
}

function UnitsPanel({organizationId, canCreate }: Props){
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const [activatingId, setActivatingId] = useState<string | null>(null);
    const [pendencies, setPendencies] = useState<{
        unitId: string;
        items: string[];
    } | null>(null);

    useEffect(() => {
    let active = true;

    UnitService.getByOrganizationId(organizationId)
      .then((data) => {
        if (!active) return;
        setUnits(data);
        setError("");
      })
      .catch(() => {
        if (active) setError("Erro ao carregar unidades");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false; //evita atualizar um painel que já fechou
    };
  }, [organizationId, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const handleActivate = async (unit: Unit) => {
    setActivatingId(unit.id);
    setPendencies(null);

    try {
      await UnitService.activate(organizationId, unit.id);
      reload(); // relê do servidor: a tela não deduz o novo estado sozinha
    } catch (e) {
      const items =
        e instanceof ApiError && e.details.length > 0
          ? e.details
          : ["Não foi possível ativar a unidade."];
      setPendencies({ unitId: unit.id, items }); // o estado anterior é mantido
    } finally {
      setActivatingId(null);
    }
};

return (
    <section className="units-panel">
      <div className="units-panel-header">
        <h3>Unidades</h3>
        <button
          className="btn-primary"
          onClick={() => setCreating(true)}
          disabled={!canCreate || creating}
          title={
            canCreate ? "" : "Só organizações ativas podem receber unidades"
          }
        >
          + Nova unidade
        </button>
      </div>

      {creating && (
        <UnitRegister
          organizationId={organizationId}
          onSaved={() => {
            setCreating(false);
            reload();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {loading && <p className="state-message">Carregando...</p>}
      {error && <p className="state-message error">{error}</p>}
      {!loading && !error && units.length === 0 && (
        <p className="state-message">Nenhuma unidade cadastrada.</p>
      )}

      {units.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Município/UF</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <Fragment key={unit.id}>
                <tr>
                  <td className="cell-main">{unit.unitCode}</td>
                  <td>{unit.unitName}</td>
                  <td>
                    {unit.unitMunicipality}/{unit.unitUF}
                  </td>
                  <td>
                    <span className="badge">{statusLabels[unit.status]}</span>
                  </td>
                  <td>
                    {canActivate(unit) && (
                      <button
                        className="btn-activate"
                        onClick={() => handleActivate(unit)}
                        disabled={activatingId === unit.id}
                      >
                        {activatingId === unit.id ? "Ativando..." : "Ativar"}
                      </button>
                    )}
                  </td>
                </tr>

                {pendencies?.unitId === unit.id && (
                  <tr>
                    <td colSpan={5} className="pendencies">
                      <strong>Não foi possível ativar. Pendências:</strong>
                      <ul>
                        {pendencies.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

}

export default UnitsPanel;