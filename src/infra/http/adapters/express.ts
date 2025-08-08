import { Request, Response, NextFunction } from "express";
import { IController, ControllerInput } from "../controllers/IController";

export const expressAdaptRoute = (controller: IController) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: ControllerInput = {
        params: req.params,
        query: req.query,
        body: req.body,
        headers: req.headers,
      };

      const { statusCode, message, data } = await controller.handle(input);

      return res.status(statusCode).json({ message, data });
    } catch (error) {
      next(error);
    }
  };
};
