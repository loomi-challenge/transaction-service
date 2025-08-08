import { Request, Response, NextFunction } from "express";
import { AppError } from "@/domain/errors/app-error"

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 500,
    message: "Erro interno no servidor",
  });
}
