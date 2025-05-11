import { Router } from "express";
import {
  criarAndamento,
  listarAndamentosPorFicha,
  deletarAndamento,
} from "../controllers/andamentoController";
import { autenticar } from "../middleware/auth";

const router = Router();

router.post("/", autenticar, criarAndamento);

router.get("/:fichaId", autenticar, listarAndamentosPorFicha);

router.delete("/:id", autenticar, deletarAndamento);

export default router;
