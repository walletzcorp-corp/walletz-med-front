//componente filho

import { useState, useEffect } from "react";
import "./organizationRegister.css";
import type { CreateOrganizationPayload } from "../../../models/organization";
import { OrganizationService } from "../../../services/OrganizationService";
import { RegionalConfiguration } from "../../../models/regionalConfiguration";

//função para limpar o cnpj de caracteres especiais, aceitando
// alfanumericos nos primeiros 12 digitos, e numericos nos 2 ultimos
function sanitizeCnpj(value: string) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (clean.slice(0, 12) + clean.slice(12).replace(/\D/g, "")).slice(0, 14);
}

function formatCnpj(value: string) {
  const p = [
    value.slice(0, 2),
    value.slice(2, 5),
    value.slice(5, 8),
    value.slice(8, 12),
    value.slice(12, 14),
  ];
  let out = p[0];
  if (p[1]) out += "." + p[1];
  if (p[2]) out += "." + p[2];
  if (p[3]) out += "/" + p[3];
  if (p[4]) out += "-" + p[4];
  return out;
}

//criação da função do registro da organização
export function OrganizationRegister() {
  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [cnpjDigits, setCnpjDigits] = useState("");
  const [taxProfile, setTaxProfile] = useState("");
  const [regionalConfigId, setRegionalConfigId] = useState("");

  const [regionalConfiguration, setRegionalConfiguration] = useState<
    RegionalConfiguration[]
  >([]);

  useEffect(() => {
    OrganizationService.getRegionalConfiguration()
      .then(setRegionalConfiguration)
      .catch((error) =>
        console.error("Erro ao carregar configuraçoes regionais:", error),
      );
  }, []);

  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CreateOrganizationPayload = {
      legalName: legalName,
      tradeName: tradeName,
      cnpjDigits: cnpjDigits,
      taxProfile: taxProfile,
      regionalConfigId: regionalConfigId,
    };

    try {
      await OrganizationService.registerOrganization(payload);
      //Avisa se a resposta foi bem-sucedida
      setMensagemSucesso(true);

      setLegalName("");
      setTradeName("");
      setCnpjDigits("");
      setTaxProfile("");
      setRegionalConfigId("");
    } catch (error) {
      console.error("Erro ao registrar organização:", error);
      setMensagemSucesso(false);
    }
  };

  return (
    <div className="organization-register">
      <h2>Cadastre sua Organização</h2>

      {mensagemSucesso && (
        <div className="success-message">
          Organização cadastrada com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* field = campo de preenchimento */}
        <div className="field">
          <label htmlFor="legalName" className="label-mandatory">
            Razão Social
          </label>
          <input
            id="legalName"
            type="text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="tradeName" className="label-mandatory">
            Nome Fantasia
          </label>
          <input
            id="tradeName"
            type="text"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="cnpjDigits" className="label-mandatory">
            CNPJ
          </label>
          <input
            id="cnpjDigits"
            type="text"
            placeholder="00.000.000/0000-00"
            maxLength={18}
            value={formatCnpj(cnpjDigits)}
            onChange={(e) => setCnpjDigits(sanitizeCnpj(e.target.value))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="taxProfile" className="label-mandatory">
            Perfil Tributário
          </label>
          <select
            required
            id="taxProfile"
            value={taxProfile}
            onChange={(e) => setTaxProfile(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="SIMPLES_NACIONAL">Simples Nacional</option>
            <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            <option value="LUCRO_REAL">Lucro Real</option>
            <option value="MEI">MEI</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="regionalConfigId" className="label-mandatory">
            Configuração Regional
          </label>
          <select
            required
            id="regionalConfigId"
            value={regionalConfigId}
            onChange={(e) => setRegionalConfigId(e.target.value)}
          >
            <option value="">Selecione</option>
            {regionalConfiguration.map((config) => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

//exporta todos os dados da funçao
export default OrganizationRegister;
