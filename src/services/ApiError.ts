export class ApiError extends Error{
    status: number;
    details: string[];

    constructor(message: string, status: number, details: string[] = []){
    super(message);
    this.status = status;
    this.details = details;
    }
}

export async function toApiError(response: Response, fallback: string) {
  let details: string[] = [];

  try {
    const body = await response.json();

    if (Array.isArray(body?.missingFields) && body.missingFields.length > 0) {
      details = body.missingFields; // 422 da ativação: ["endereço", "fuso horário"]
    } else if (Array.isArray(body?.message)) {
      details = body.message; // 400 de validação de campos
    } else if (typeof body?.message === "string") {
      details = [body.message]; // 400/404/409 de regra de negócio
    }
  } catch {
    // resposta sem JSON: segue só com o status
  }

  return new ApiError(fallback, response.status, details);
}


// Mensagem amigável para exibir na tela (inclui os detalhes devolvidos pela API).
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.details.length > 0) {
    return `${error.message}: ${error.details.join(", ")}`;
  }
  return error instanceof Error ? error.message : String(error);
}
