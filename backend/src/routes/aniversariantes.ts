import { Router } from "express";
import { listarAniversariantesDoDia } from "../controllers/aniversariantesController";

const router = Router();

router.get("/", listarAniversariantesDoDia);

export default router;
