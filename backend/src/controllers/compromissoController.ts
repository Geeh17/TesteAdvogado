import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { z } from "zod";
import { logAction } from "../utils/logAction";

const compromissoSchema = z.object({
  titulo: z.string().min(3, "Título é obrigatório"),
  descricao: z.string().optional(),
  dataHora: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data e hora inválida",
  }),
  tipo: z.enum(["AUDIENCIA", "REUNIAO", "PRAZO"], {
    errorMap: () => ({ message: "Tipo de compromisso inválido" }),
  }),
});

const objectIdRegex = /^[a-f\d]{24}$/i;

export const listarCompromissos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const compromissos = await prisma.compromisso.findMany({
      where: { usuarioId },
      orderBy: { dataHora: "asc" },
    });

    res.status(200).json(compromissos);
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao listar compromissos", detalhes: error });
  }
};

export const criarCompromisso = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const dados = compromissoSchema.parse(req.body);

    const compromisso = await prisma.compromisso.create({
      data: {
        titulo: dados.titulo,
        descricao: dados.descricao,
        dataHora: new Date(dados.dataHora),
        tipo: dados.tipo,
        usuarioId,
      },
    });

    await logAction({
      acao: "CREATE",
      tabela: "Compromisso",
      registroId: compromisso.id,
      usuarioId,
    });

    res.status(201).json(compromisso);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ erro: "Dados inválidos", detalhes: error.errors });
    } else {
      res
        .status(500)
        .json({ erro: "Erro ao criar compromisso", detalhes: error });
    }
  }
};

export const deletarCompromisso = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    if (!objectIdRegex.test(id)) {
      res.status(400).json({ erro: "ID inválido" });
      return;
    }

    await prisma.compromisso.delete({
      where: { id },
    });

    await logAction({
      acao: "DELETE",
      tabela: "Compromisso",
      registroId: id,
      usuarioId,
    });

    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao deletar compromisso", detalhes: error });
  }
};
