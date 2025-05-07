import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { MongoClient } from "mongodb";

// Opcional: importar da instância atual, se preferir centralizar
const mongo = new MongoClient(process.env.DATABASE_URL!);
const db = mongo.db(); // banco padrão do MongoDB Atlas

export async function getDashboard(req: Request, res: Response) {
  try {
    const totalClientes = await prisma.cliente.count();
    const totalFichas = await prisma.ficha.count();

    // Fichas por mês usando agregação do MongoDB
    const fichasPorMes = await db
      .collection("Ficha")
      .aggregate([
        {
          $group: {
            _id: { $month: "$data" },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 6 },
      ])
      .toArray();

    const parsedFichasPorMes = fichasPorMes.map((item) => ({
      mes: item._id,
      total: item.total,
    }));

    res.json({
      totalClientes,
      totalFichas,
      fichasPorMes: parsedFichasPorMes,
    });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    res.status(500).json({ message: "Erro ao carregar dashboard", error });
  }
}

export async function getClientesPorMes(req: Request, res: Response) {
  try {
    const clientesPorMes = await db
      .collection("Cliente")
      .aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 6 },
      ])
      .toArray();

    const parsedClientesPorMes = clientesPorMes.map((item) => ({
      mes: item._id,
      total: item.total,
    }));

    res.json(parsedClientesPorMes);
  } catch (error) {
    console.error("Erro ao buscar clientes por mês:", error);
    res.status(500).json({ message: "Erro ao buscar clientes por mês", error });
  }
}

export async function getRankingAdvogados(req: Request, res: Response) {
  try {
    const ranking = await prisma.cliente.groupBy({
      by: ["usuarioId"],
      _count: { id: true },
      orderBy: {
        _count: { id: "desc" },
      },
    });

    const rankingComNomes = await Promise.all(
      ranking.map(async (item) => {
        const usuario = await prisma.usuario.findUnique({
          where: { id: item.usuarioId },
          select: { nome: true },
        });

        return {
          nome: usuario?.nome || `ID ${item.usuarioId}`,
          total: item._count.id,
        };
      })
    );

    res.json(rankingComNomes);
  } catch (error) {
    console.error("Erro ao buscar ranking de advogados:", error);
    res
      .status(500)
      .json({ message: "Erro ao buscar ranking de advogados", error });
  }
}
