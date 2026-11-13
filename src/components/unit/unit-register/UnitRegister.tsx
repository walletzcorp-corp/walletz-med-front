import { use, useState } from "react";
import { CreateUnitPayload } from "../../../models/unit";
import "./unitRegister.css";
import { UnitService } from "../../../services/UnitService";
import { ApiError } from "../../../services/ApiError";

interface Props{
  organizationId: string;
  onSaved: () => void;
  onCancel: () => void
}

export function UnitRegister({organizationId, onSaved, onCancel}: Props) {
  const [unitName, setUnitName] = useState("");
  const [unitCountry, setUnitCountry] = useState("");
  const [unitAddress, setUnitAddress] = useState("");
  const [unitMunicipality, setUnitMunicipality] = useState("");
  const [unitUF, setUnitUF] = useState("");
  const [unitTimezone, setUnitTimezone] = useState("");

  const [erros, setErros] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    
    event.preventDefault();
    setSaving(true);
    setErros([]);
    
    const payload: CreateUnitPayload = {
      unitName: unitName,
      unitAddress: unitAddress,
      unitMunicipality: unitMunicipality,
      unitUF: unitUF,
      unitTimezone: unitTimezone,
    };

    try {
      await UnitService.create(organizationId, payload);
      onSaved(); // o painel fecha o formulário e recarrega a lista
    } catch (error) {
      if (error instanceof ApiError && error.details.length > 0) {
        setErros(error.details);
      } else {
        setErros(["Não foi possível cadastrar a unidade."]);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="unit-register">
      <h2>Nova unidade</h2>

      {erros.length > 0 && (
        <div className="error-message">
          {erros.map((erro) => (
            <div key={erro}>{erro}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="unitName" className="label-mandatory">
            Nome da Unidade:
          </label>
          <input
            id="unitName"
            type="text"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="unitCountry" className="label-mandatory">
            País:
          </label>
          <input
            id="unitCountry"
            type="text"
            value={unitCountry}
            onChange={(e) => setUnitCountry(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="unitAddress" className="label-mandatory">
            Endereço:
          </label>
          <input
            id="unitAddress"
            type="text"
            value={unitAddress}
            onChange={(e) => setUnitAddress(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="unitMunicipality" className="label-mandatory">
            Município:
          </label>
          <input
            id="unitMunicipality"
            type="text"
            value={unitMunicipality}
            onChange={(e) => setUnitMunicipality(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="unitUF" className="label-mandatory">
            UF:
          </label>
          <input
            id="unitUF"
            type="text"
            value={unitUF}
            onChange={(e) => setUnitUF(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="unitTimezone" className="label-mandatory">
            Fuso Horário:
          </label>
          <select
            required
            id="unitTimezone"
            value={unitTimezone}
            onChange={(e) => setUnitTimezone(e.target.value)}
          >
            <option value="">Selecione o fuso horário</option>
            <option value="America/Sao_Paulo">America/Sao_Paulo</option>
            <option value="America/Manaus">America/Manaus</option>
            <option value="America/Cuiaba">America/Cuiaba</option>
            <option value="America/Recife">America/Recife</option>
          </select>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Cadastrar Unidade"}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default UnitRegister;
