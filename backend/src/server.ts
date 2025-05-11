import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import authRoutes from "./routes/auth";
import usuarioRoutes from "./routes/usuarios";
import clienteRoutes from "./routes/clientes";
import fichaRoutes from "./routes/fichas";
import dashboardRoutes from "./routes/dashboard";
import andamentoRoutes from "./routes/andamentos";
import compromissoRoutes from "./routes/compromissos";
import logsRouter from "./routes/logs";
import aniversariantesRoutes from "./routes/aniversariantes";

const app = express();

const allowedOrigins = ["http://localhost:3001", "https://advotec.netlify.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/clientes", clienteRoutes);
app.use("/fichas", fichaRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/andamentos", andamentoRoutes);
app.use("/compromissos", compromissoRoutes);
app.use("/logs", logsRouter);
app.use("/aniversariantes", aniversariantesRoutes);

app.listen(3000, () => {
  console.log("✅ Servidor rodando na porta 3000");
  console.log("🌐 API disponível em: http://localhost:3000");
});
