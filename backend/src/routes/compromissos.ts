import { Router } from "express";
import {
  listarCompromissos,
  criarCompromisso,
  deletarCompromisso,
} from "../controllers/compromissoController";
import { autenticar } from "../middleware/auth";

const router = Router();

router.get("/", autenticar, listarCompromissos);
router.post("/", autenticar, criarCompromisso);
router.delete("/:id", autenticar, deletarCompromisso);

export default router;
