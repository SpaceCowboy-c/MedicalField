import "dotenv/config"; //le o.env
import express from "express";  // framework que cria o servidor HTTP
import { authRouter } from "./routes/auth"; //o grupo de rotas do login, definido em routes/auth.ts

const app = express(); //Cria a aplicação (o servidor).
app.use(express.json()); //Ensina o servidor a ler corpo em JSON.

app.get("/health", (_req, res) => { //rota de teste para verificar se o servidor está rodando
    res.json({ status: "ok", servico: "auth" }); 
});

app.use("/auth", authRouter); // Monta o grupo de rotas sob o prefixo "/auth".

// Lê a porta do .env (padrão 8082) e começa a escutar pedidos.
const PORT = Number(process.env.PORT ?? 8082);
app.listen(PORT, () => {
    console.log(`Auth rodando na porta ${PORT}`);
});