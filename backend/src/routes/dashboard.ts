import { Router } from "express";
import { autenticar } from "../middleware/auth";
import {
  getDashboard,
  getClientesPorMes,
  getRankingAdvogados,
} from "../controllers/dashboardController";

const router = Router();

router.get("/", autenticar, getDashboard);
router.get("/clientes-por-mes", autenticar, getClientesPorMes);
router.get("/ranking-advogados", autenticar, getRankingAdvogados);

export default router;
