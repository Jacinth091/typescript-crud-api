import { Request, Response } from "express";

export const guestContent = async (req: Request, res: Response): Promise<any> => {
  res.json({
    message: "Public content for all visitors",
  });
};
