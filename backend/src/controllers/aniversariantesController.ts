import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Cliente = Awaited<ReturnType<typeof prisma.cliente.findFirst>>;

export const listarAniversariantesDoDia = async (
  req: Request,
  res: Response
) => {
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtual = hoje.getMonth() + 1;

  try {
    const aniversariantes = await prisma.cliente.findMany({
      where: {
        dataAniversario: {
          not: null,
        },
      },
    });

    const filtrados = aniversariantes.filter((cliente: Cliente) => {
      const data = new Date(cliente!.dataAniversario!);
      return data.getDate() === diaAtual && data.getMonth() + 1 === mesAtual;
    });

    res.status(200).json(filtrados);
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao buscar aniversariantes", detalhes: error });
  }
};
