import { Request, Response } from "express";
import User from "../models/user.model";

export const getUser = async (req: Request, res: Response) => {
  const user = await User.find();
  res.json(user);
};
