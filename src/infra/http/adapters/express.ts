import { Request, Response } from "express";
import { IController, ControllerInput } from "../controllers/IController";

export const expressAdaptRoute = (controller: IController) => {
  return async (req: Request, res: Response) => {
    try {
      const input: ControllerInput = {
        params: req.params,
        query: req.query,
        body: req.body,
        headers: req.headers,
        // user: req.user,
      };

      const { statusCode, message, data } = await controller.handle(input);

      return res.status(statusCode).json({ message, data });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  };
};
