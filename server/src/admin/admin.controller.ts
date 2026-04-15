import { Request, Response } from "express";

export const adminDashboard = async (req: Request, res: Response): Promise<any> => {
  res.json({
    message: `Welcome to admin dashboard!`,
    data: "Secret admin info",
  });
};
