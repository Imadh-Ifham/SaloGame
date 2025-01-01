import { Request, Response } from "express";
import { LayoutShape } from "../../models/blueprint.model/layoutShape.model";

export const createShape = async (req: Request, res: Response) => {
  try {
    const { name, type, shapeData, preview } = req.body;
    const shape = await LayoutShape.create({ name, type, shapeData, preview });
    res.status(201).json(shape);
  } catch (error) {
    res.status(500).json({ error: "Failed to create shape" });
  }
};

export const getAllShapes = async (req: Request, res: Response) => {
  try {
    const shapes = await LayoutShape.find().sort({ createdAt: -1 });
    res.status(200).json(shapes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shapes" });
  }
};

export const deleteShape = async (req: Request, res: Response) => {
  try {
    const { shapeId } = req.params;
    await LayoutShape.findByIdAndDelete(shapeId);
    res.status(200).json({ message: "Shape deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete shape" });
  }
};
