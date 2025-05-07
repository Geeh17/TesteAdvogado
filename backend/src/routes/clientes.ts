import { Router } from "express";
import {
  criarCliente,
  listarClientes,
  buscarClientePorId,
  atualizarCliente,
  deletarCliente
} from "../controllers/clienteController";
import { autenticar } from "../middleware/auth";

const router = Router();

router.use(autenticar);

router.post("/", criarCliente);
router.get("/", listarClientes);
router.get("/:id", buscarClientePorId);
router.put("/:id", atualizarCliente);
router.delete("/:id", deletarCliente);

export default router;
