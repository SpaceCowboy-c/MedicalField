import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok", servico: "auth" });
});

const PORT = 8082;
app.listen(PORT, () => {
    console.log(`testando ${PORT}`);
});