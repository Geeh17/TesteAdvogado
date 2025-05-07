import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtPayload {
  id: string; // compatível com MongoDB
  role: string;
}

export const autenticar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ erro: "Token não fornecido" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "segredo"
    ) as JwtPayload;

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    });

    if (!usuario || !usuario.ativo) {
      res.status(401).json({ erro: "Usuário não encontrado ou inativo" });
      return;
    }

    req.usuario = usuario;
    req.usuarioId = String(usuario.id); // ✅ conversão explícita

    next();
  } catch (error) {
    res.status(401).json({ erro: "Token inválido" });
  }
};
