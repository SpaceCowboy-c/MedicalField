import { API_AUTH_URL, TIMEOUT_MS } from "../config"; //Importa o endereço da API de autenticação e o tempo limite da requisição.

// Define a estrutura dos dados de um profissional.
export type Profissional = {
    id: number;
    nome: string;
    registro: string;
    perfil: "ADMIN" | "SOCORRISTA";
};

// Define a estrutura da resposta recebida após um login bem-sucedido.
export type LoginResposta = {
    token: string;
    profissional: Profissional;
};

//classe para tratar os erros
export class AuthError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
    }
}

// Função responsável por realizar o login através da API de autenticação.
export async function login(email: string, senha: string): Promise<LoginResposta> {

    const controlador = new AbortController(); //controla o tempo da requisição
    const timer = setTimeout(() => controlador.abort(), TIMEOUT_MS); //tempo maximo da rqeuisição.

    try {
        // Envia uma requisição POST para a rota de login do backend.
        const resposta = await fetch(`${API_AUTH_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),  // Converte os dados para JSON.
            signal: controlador.signal,
        });


        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new AuthError(dados.erro ?? "Falha ao entrar", resposta.status);
        }

        return dados as LoginResposta;
    } catch (e) {
        if (e instanceof AuthError) throw e;
        throw new AuthError("Não foi possível conectar ao servidor");
    } finally {
        clearTimeout(timer);
    }
}