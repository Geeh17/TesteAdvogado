import { Request, Response, NextFunction } from "express";

export function authorize(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const roleUsuario = req.usuario?.role;

    if (!roleUsuario) {
      res.status(401).json({ message: "Usuário não autenticado" });
      return;
    }

    if (!rolesPermitidos.includes(roleUsuario)) {
      res
        .status(403)
        .json({ message: "Acesso negado: permissão insuficiente" });
      return;
    }

    next();
  };
}
