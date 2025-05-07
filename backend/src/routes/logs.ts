import { Router } from "express";
import { prisma } from "../prisma/client";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      include: {
        usuario: {
          select: { nome: true, email: true },
        },
      },
      orderBy: { data: "desc" },
    });

    res.json(logs);
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    res.status(500).json({ erro: "Erro ao buscar logs", detalhes: error });
  }
});

export default router;
