import { prisma } from "../prisma/client";

interface LogParams {
  acao: "CREATE" | "UPDATE" | "DELETE";
  tabela: string;
  registroId: string; // MongoDB ObjectId como string
  usuarioId: string; // também ObjectId como string
}

export async function logAction({
  acao,
  tabela,
  registroId,
  usuarioId,
}: LogParams) {
  try {
    await prisma.log.create({
      data: {
        acao,
        tabela,
        registroId,
        usuarioId,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar log:", error);
  }
}
