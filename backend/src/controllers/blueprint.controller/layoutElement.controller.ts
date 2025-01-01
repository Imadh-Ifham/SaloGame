import { Request, Response } from "express";
import { LayoutElement } from "../../models/blueprint.model/layoutElement.model";

export const addElement = async (req: Request, res: Response) => {
  try {
    const { layoutId, shapeId, x, y, rotation, zIndex, isMachine, machineId } =
      req.body;
    const element = await LayoutElement.create({
      layoutId,
      shapeId,
      x,
      y,
      rotation,
      zIndex,
      isMachine,
      machineId,
    });
    res.status(201).json(element);
  } catch (error) {
    res.status(500).json({ error: "Failed to add element" });
  }
};

export const getElementsByLayout = async (req: Request, res: Response) => {
  try {
    const { layoutId } = req.params;
    const elements = await LayoutElement.find({ layoutId })
      .populate("shapeId")
      .populate("machineId");
    res.status(200).json(elements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch elements" });
  }
};

export const deleteElement = async (req: Request, res: Response) => {
  try {
    const { elementId } = req.params;
    await LayoutElement.findByIdAndDelete(elementId);
    res.status(200).json({ message: "Element deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete element" });
  }
};
