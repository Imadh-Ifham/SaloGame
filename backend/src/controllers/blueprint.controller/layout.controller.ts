import { Request, Response } from "express";
import { Layout } from "../../models/blueprint.model/layout.model";
import { LayoutElement } from "../../models/blueprint.model/layoutElement.model";

export const createLayout = async (req: Request, res: Response) => {
  try {
    const { name, createdBy } = req.body;
    const layout = await Layout.create({ name, createdBy });
    res.status(201).json(layout);
  } catch (error) {
    res.status(500).json({ error: "Failed to create layout" });
  }
};

export const getAllLayouts = async (req: Request, res: Response) => {
  try {
    const layouts = await Layout.find().sort({ createdAt: -1 });
    res.status(200).json(layouts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch layouts" });
  }
};

export const setActiveLayout = async (req: Request, res: Response) => {
  try {
    const { layoutId } = req.params;
    await Layout.updateMany({}, { isActive: false }); // Deactivate all layouts
    const layout = await Layout.findByIdAndUpdate(
      layoutId,
      { isActive: true },
      { new: true }
    );
    res.status(200).json(layout);
  } catch (error) {
    res.status(500).json({ error: "Failed to set active layout" });
  }
};

export const deleteLayout = async (req: Request, res: Response) => {
  try {
    const { layoutId } = req.params;
    await LayoutElement.deleteMany({ layoutId });
    await Layout.findByIdAndDelete(layoutId);
    res.status(200).json({ message: "Layout deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete layout" });
  }
};
