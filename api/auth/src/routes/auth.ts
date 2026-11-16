import { Router } from "express";  //Permite criar e organizar as rotas da aplicação.
import bcrypt from "bcryptjs";  //compara senhas
import jwt from "jsonwebtoken"; //gera tokens
import { pool } from "../db"; // Permite realizar consultas e acessar o banco de dados.

// Cria um agrupamento de rotas do Express.
// Todas as rotas relacionadas à autenticação ficarão dentro desse router.
export const authRouter = Router(); 

// Define uma rota POST para realizar o login.
// O usuário enviará o email e a senha no corpo (body) da requisição.
authRouter.post("/login", async (req, res) => {
    const { email, senha } = req.body ?? {};  // Extrai o email e a senha enviados pelo frontend.

    if (!email || !senha) { // Verifica se o usuário informou os dois campos obrigatórios.
    res.status(400).json({ erro: "Informe email e senha" });
    return;
  }

    // Consulta o banco de dados para encontrar um profissional
    // com o email informado.
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, registro, senha_hash, perfil
         FROM profissional
        WHERE email = $1`, //SQL Injection
        // Envia o email como parâmetro da consulta.
      [String(email).toLowerCase()]
    );

      // Obtém o primeiro resultado encontrado no banco.
      // Se nenhum profissional for encontrado, rows[0] será undefined.
    const profissional = rows[0];

    //compara o hash da senha informada com o hash armazenado no banco de dados.
    const senhaOk =
      profissional && (await bcrypt.compare(String(senha), profissional.senha_hash));

      // Se a senha não estiver correta, retorna um erro 401 (não autorizado).
    if (!senhaOk) {
      res.status(401).json({ erro: "Credenciais inválidas" });
      return;
    }

    // Se a senha estiver correta, gera um token JWT (JSON Web Token).
    const token = jwt.sign(
        //informações que serão armazenadas no token
      {
        sub: String(profissional.id),
        registro: profissional.registro,
        perfil: profissional.perfil,
        nome: profissional.nome,
      },
      // Chave secreta usada para assinar o token
      process.env.JWT_SECRET as string,
      //tempo de expiração do token
      { expiresIn: "12h" }
    );

      // Se tudo ocorrer corretamente, retorna uma resposta JSON
      // contendo o token JWT e os dados básicos do profissional.
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