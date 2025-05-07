import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { logAction } from "../utils/logAction";

const prisma = new PrismaClient();
const objectIdRegex = /^[a-f\d]{24}$/i;

const fichaSchema = z.object({
  descricao: z
    .string()
    .min(5, "Descrição é obrigatória e deve ter no mínimo 5 caracteres"),
});

export const criarFicha = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const clienteId = req.params.clienteId;

    if (!objectIdRegex.test(clienteId)) {
      res.status(400).json({ erro: "ID do cliente inválido" });
      return;
    }

    const dados = fichaSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });

    const cliente = await prisma.cliente.findFirst({
      where:
        usuario?.role === "MASTER"
          ? { id: clienteId }
          : { id: clienteId, usuarioId: req.usuarioId },
    });

    if (!cliente) {
      res.status(404).json({
        erro: "Cliente não encontrado ou não pertence a este usuário",
      });
      return;
    }

    const ficha = await prisma.ficha.create({
      data: {
        descricao: dados.descricao,
        clienteId,
      },
    });

    await logAction({
      acao: "CREATE",
      tabela: "Ficha",
      registroId: ficha.id,
      usuarioId: req.usuarioId,
    });

    res.status(201).json(ficha);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ erro: "Dados inválidos", detalhes: error.errors });
    } else {
      res.status(500).json({ erro: "Erro ao criar ficha", detalhes: error });
    }
  }
};

export const listarFichasDoCliente = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const clienteId = req.params.clienteId;

    if (!objectIdRegex.test(clienteId)) {
      res.status(400).json({ erro: "ID do cliente inválido" });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });

    const cliente = await prisma.cliente.findFirst({
      where:
        usuario?.role === "MASTER"
          ? { id: clienteId }
          : { id: clienteId, usuarioId: req.usuarioId },
    });

    if (!cliente) {
      res.status(404).json({
        erro: "Cliente não encontrado ou não pertence a este usuário",
      });
      return;
    }

    const fichas = await prisma.ficha.findMany({
      where: { clienteId },
      orderBy: { data: "desc" },
    });

    res.json(fichas);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar fichas", detalhes: error });
  }
};
