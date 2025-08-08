// src/infra/http/validators/create-transaction.validator.ts
import { z } from "zod";
import { AppError } from "@/domain/errors/app-error";
import { NextFunction, Request, Response } from "express";
export const createTransactionSchema = z.object({
  receiverUserId: z
    .string()
    .nonempty({ message: "ID do usuário é obrigatório" }),
  amount: z.number().positive({ message: "O valor deve ser positivo" }),
  description: z.string().min(3, { message: "Descrição muito curta" }),
});

export function validateCreateTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = createTransactionSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    next(error);
  }
}
