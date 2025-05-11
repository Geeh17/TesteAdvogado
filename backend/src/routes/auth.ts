import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha é obrigatória"),
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.ativo) {
      res
        .status(401)
        .json({ message: "Usuário inativo ou credenciais inválidas" });
      return;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      res.status(401).json({ message: "Credenciais inválidas" });
      return;
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ erro: "Dados inválidos", detalhes: error.errors });
    } else {
      res.status(500).json({ erro: "Erro ao realizar login", detalhes: error });
    }
  }
});

export default router;
