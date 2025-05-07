import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import {
  criarFicha,
  listarFichasDoCliente,
} from "../controllers/fichaController";
import { autenticar } from "../middleware/auth";
import PDFDocument from "pdfkit";

const router = Router();
const prisma = new PrismaClient();

router.post("/:clienteId", autenticar, criarFicha);
router.get("/:clienteId", autenticar, listarFichasDoCliente);

router.get("/:id/pdf", autenticar, async (req, res): Promise<void> => {
  const { id } = req.params;

  // ✅ Validação para ObjectId
  if (!/^[a-f\d]{24}$/i.test(id)) {
    res.status(400).send("ID inválido");
    return;
  }

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    include: { cliente: true },
  });

  if (!ficha || !ficha.cliente) {
    res.status(404).send("Ficha não encontrada");
    return;
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="ficha.pdf"');
  doc.pipe(res);

  doc.fontSize(20).text("Ficha de Atendimento", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Cliente: ${ficha.cliente.nome}`);
  doc.text(`CPF: ${ficha.cliente.cpf}`);
  doc.text(`Telefone: ${ficha.cliente.telefone}`);
  doc.moveDown();
  doc.text(`Data: ${new Date(ficha.data).toLocaleDateString()}`);
  doc.text(`Descrição: ${ficha.descricao}`);
  doc.end();
});

export default router;
