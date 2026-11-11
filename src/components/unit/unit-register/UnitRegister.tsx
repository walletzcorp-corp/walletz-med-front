import { useState } from "react";
import { CreateUnitPayload } from "../../../models/unit";
import "./unitRegister.css";

export function UnitRegister() {
  const [unitName, setUnitName] = useState("");
  const [unitCountry, setUnitCountry] = useState("");
  const [unitAddress, setUnitAddress] = useState("");
  const [unitMunicipality, setUnitMunicipality] = useState("");
  const [unitUF, setUnitUF] = useState("");
  const [unitTimezone, setUnitTimezone] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const payload: CreateUnitPayload = {
      unitName: unitName,
      unitCountry: unitCountry,
      unitAddress: unitAddress,
      unitMunicipality: unitMunicipality,
      unitUF: unitUF,
      unitTimezone: unitTimezone,
    };

    try {
      setUnitName("");
      setUnitCountry("");
      setUnitAddress("");
      setUnitMunicipality("");
      setUnitUF("");
      setUnitTimezone("");
    } catch (error) {
      console.error("Erro ao registrar unidade:", error);
      setMensagemSucesso(false);
    }
  };

  return (
    <div className="unit-register">
      <h2>Cadastrar Unidade</h2>

      {mensagemSucesso && (
        <div className="success-message">Unidade registrada com sucesso!</div>
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

        <button type="submit">Cadastrar Unidade</button>
      </form>
    </div>
  );
}

export default UnitRegister;
