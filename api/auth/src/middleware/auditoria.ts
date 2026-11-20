import { Request, Response, NextFunction } from "express";
import { pool } from "../db";

// Middleware responsável por registrar as requisições realizadas no serviço.
export function auditoria(req: Request, res: Response, next: NextFunction) {
    const inicio = Date.now();  // Registra o horário inicial
    const dataHora = new Date(); // Armazena a data e o horário em que a requisição começou

    res.on("finish", () => { //quando a requisição terminar, calcula o tempo de execução e o profissional
        const tempoMs = Date.now() - inicio;
        const profissionalId = (req as any).profissional?.id ?? null;

        // Insere as informações da requisição na tabela de auditoria.
        pool
            .query(
                `INSERT INTO log_acesso
           (data_hora, ip_cliente, profissional_id, metodo, rota, status_code, tempo_ms, servico)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    dataHora,
                    req.ip, //ip
                    profissionalId,
                    req.method, //get,post,put,delete
                    req.originalUrl.split("?")[0],  // Rota acessada
                    res.statusCode, //Código HTTP
                    tempoMs,
                    "auth",
                ]
            )
            .catch((erro) => console.error("Falha ao gravar log:", erro.message));
    });

    next();
}