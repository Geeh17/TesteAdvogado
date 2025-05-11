import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { logAction } from "../utils/logAction";

const prisma = new PrismaClient();
const objectIdRegex = /^[a-f\d]{24}$/i;

const clienteSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve conter 11 dígitos"),
  telefone: z.string().min(8, "Telefone é obrigatório"),
  endereco: z.string().optional(),
  dataAniversario: z.string().optional(),
});

export const criarCliente = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const dados = clienteSchema.parse(req.body);

    const cliente = await prisma.cliente.create({
      data: {
        ...dados,
        dataAniversario: dados.dataAniversario?.trim()
          ? new Date(dados.dataAniversario)
          : undefined,
        usuarioId: req.usuarioId,
      },
    });

    await logAction({
      acao: "CREATE",
      tabela: "Cliente",
      registroId: cliente.id,
      usuarioId: req.usuarioId,
    });

    res.status(201).json(cliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ erro: "Dados inválidos", detalhes: error.errors });
    } else {
      res.status(500).json({ erro: "Erro ao criar cliente", detalhes: error });
    }
  }
};

export const listarClientes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });

    const clientes = await prisma.cliente.findMany({
      where: usuario?.role === "MASTER" ? {} : { usuarioId: req.usuarioId },
      include: { fichas: true },
    });

    res.json(clientes);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar clientes", detalhes: error });
  }
};

export const buscarClientePorId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const id = req.params.id;

    if (!objectIdRegex.test(id)) {
      res.status(400).json({ erro: "ID inválido" });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });

    const cliente = await prisma.cliente.findFirst({
      where:
        usuario?.role === "MASTER" ? { id } : { id, usuarioId: req.usuarioId },
      include: { fichas: true },
    });

    if (!cliente) {
      res.status(404).json({ erro: "Cliente não encontrado" });
      return;
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar cliente", detalhes: error });
  }
};

export const atualizarCliente = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const id = req.params.id;

    if (!objectIdRegex.test(id)) {
      res.status(400).json({ erro: "ID inválido" });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });

    const cliente = await prisma.cliente.findFirst({
      where:
        usuario?.role === "MASTER" ? { id } : { id, usuarioId: req.usuarioId },
    });

    if (!cliente) {
      res.status(404).json({ erro: "Cliente não encontrado" });
      return;
    }

    const dados = clienteSchema.parse(req.body);

    const cpfEmUso = await prisma.cliente.findFirst({
      where: {
        cpf: dados.cpf,
        NOT: { id },
      },
    });

    if (cpfEmUso) {
      res.status(400).json({ erro: "CPF já está em uso por outro cliente" });
      return;
    }

    const atualizado = await prisma.cliente.update({
      where: { id },
      data: {
        ...dados,
        dataAniversario: dados.dataAniversario?.trim()
          ? new Date(dados.dataAniversario)
          : undefined,
      },
    });

    await logAction({
      acao: "UPDATE",
      tabela: "Cliente",
      registroId: id,
      usuarioId: req.usuarioId,
    });

    res.json(atualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ erro: "Dados inválidos", detalhes: error.errors });
    } else {
      res
        .status(500)
        .json({ erro: "Erro ao atualizar cliente", detalhes: error });
    }
  }
};

export const deletarCliente = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ erro: "Usuário não autenticado" });
      return;
    }

    const id = req.params.id;

    if (!objectIdRegex.test(id)) {
      res.status(400).json({ erro: "ID inválido" });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });

    const cliente = await prisma.cliente.findFirst({
      where:
        usuario?.role === "MASTER" ? { id } : { id, usuarioId: req.usuarioId },
    });

    if (!cliente) {
      res.status(404).json({ erro: "Cliente não encontrado" });
      return;
    }

    await prisma.cliente.delete({ where: { id } });

    await logAction({
      acao: "DELETE",
      tabela: "Cliente",
      registroId: id,
      usuarioId: req.usuarioId,
    });

    res.json({ mensagem: "Cliente deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar cliente", detalhes: error });
  }
};
