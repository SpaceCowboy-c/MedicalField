import "dotenv/config";

// Verifica se todas as variáveis obrigatórias estão configuradas.
for (const v of ["JWT_SECRET", "DB_NAME", "DB_USER", "DB_PASSWORD"]) {
    if (!process.env[v]) {
        console.error(`Variável de ambiente ausente: ${v}`);
        process.exit(1);
    }
}

import express from "express"; //gerencia as rotas
import cors from "cors"; // Permite requisições de diferentes origens.
import { authRouter } from "./routes/auth";  
import { auditoria } from "./middleware/auditoria"; //mildaware que controla os registros de acesso

const app = express(); //cria a aplicação

// Configura os middlewares utilizados pelo servidor.
app.use(cors());
app.use(express.json());
app.use(auditoria);

app.get("/health", (_req, res) => {
    res.json({ status: "ok", servico: "auth" });
});

app.use("/auth", authRouter); // Registra as rotas de autenticação com o prefixo /auth.

app.use((_req, res) => {
    res.status(404).json({ erro: "Rota não encontrada" }); // Retorna HTTP 404.
});

// Middleware responsável por capturar erros ocorridos durante as requisições.
app.use((erro: any, _req: any, res: any, _next: any) => {
    console.error(erro);
    res.status(erro.status ?? 500).json({ erro: "Erro interno" });
});

const PORT = Number(process.env.PORT ?? 8082); //porta definida

app.listen(PORT, "0.0.0.0", () => { 
    console.log(`Auth rodando na porta ${PORT}`);
});