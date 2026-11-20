import { Router } from "express";  
import bcrypt from "bcryptjs";  //compara senhas
import jwt from "jsonwebtoken"; 
import { pool } from "../db"; 

// Todas as rotas relacionadas à autenticação ficarão dentro desse router.
export const authRouter = Router(); 

// Define uma rota POST para realizar o login.
authRouter.post("/login", async (req, res) => {
    const { email, senha } = req.body ?? {};  // Extrai o email e a senha enviados pelo frontend.

    if (!email || !senha) { // Verifica 
    res.status(400).json({ erro: "Informe email e senha" });
    return;
  }

    // Consulta o banco de dados para encontrar um profissional com o email fornecido.
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, registro, senha_hash, perfil
         FROM profissional
        WHERE email = $1`, //SQL Injection
      [String(email).toLowerCase()]
    );

    // Obtém o primeiro resultado encontrado no banco.
    const profissional = rows[0];

    //compara o hash da senha informada com o hash armazenado no banco de dados.
    const senhaOk =
      profissional && (await bcrypt.compare(String(senha), profissional.senha_hash));

    if (!senhaOk) {
      res.status(401).json({ erro: "Credenciais inválidas" });
      return;
    }

    // Se a senha estiver correta, gera um token JWT (JSON Web Token).
    const token = jwt.sign(
      {
        sub: String(profissional.id),
        registro: profissional.registro,
        perfil: profissional.perfil,
        nome: profissional.nome,
      },
      // Chave secreta usada para assinar o token
      process.env.JWT_SECRET as string,
      { expiresIn: "12h" }
    );

  // Se tudo ocorrer corretamente, retorna uma resposta JSON
    res.json({
      token,
      profissional: {
        id: profissional.id,
        nome: profissional.nome,
        registro: profissional.registro,
        perfil: profissional.perfil,
      },
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro interno" });
  }
});