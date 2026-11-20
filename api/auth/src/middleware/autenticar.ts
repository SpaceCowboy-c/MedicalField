import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Middleware que verifica a autenticação do usuário através do token JWT.
export function autenticar(req: Request, res: Response, next: NextFunction) {
    const cabecalho = req.headers.authorization ?? ""; // Obtém o token enviado no cabeçalho Authorization.
    const [tipo, token] = cabecalho.split(" ");

    // Verifica se o cabeçalho possui o formato esperado e se o token foi informado.
    if (tipo !== "Bearer" || !token) {
        res.status(401).json({ erro: "Token não informado" });
        return;
    }

    try {
        // Valida a assinatura e a validade do token utilizando a chave secreta.
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        // Armazena os dados do profissional na requisição.
        (req as any).profissional = {
            id: Number(payload.sub),
            registro: payload.registro,
            perfil: payload.perfil,
            nome: payload.nome,
        };
        next();
    } catch {
        res.status(401).json({ erro: "Token inválido ou expirado" });
    }
}