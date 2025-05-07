import { Router } from "express";
import {
  criarAndamento,
  listarAndamentosPorFicha,
  deletarAndamento,
} from "../controllers/andamentoController";
import { autenticar } from "../middleware/auth";

const router = Router();

// Criação de andamento vinculado a uma ficha
router.post("/", autenticar, criarAndamento);

// Listagem de andamentos por ficha
router.get("/:fichaId", autenticar, listarAndamentosPorFicha);

// Remoção de andamento por ID
router.delete("/:id", autenticar, deletarAndamento);

export default router;
