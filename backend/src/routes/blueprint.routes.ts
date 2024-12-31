import express from "express";
import * as LayoutController from "../controllers/blueprint.controller/layout.controller";
import * as ShapeController from "../controllers/blueprint.controller/layoutShape.controller";
import * as ElementController from "../controllers/blueprint.controller/layoutElement.controller";

const router = express.Router();

// Layout Routes
router.post("/", LayoutController.createLayout);
router.get("/", LayoutController.getAllLayouts);
router.patch("/:layoutId/activate", LayoutController.setActiveLayout);
router.delete("/:layoutId", LayoutController.deleteLayout);

// Shape Routes
router.post("/shapes", ShapeController.createShape);
router.get("/shapes", ShapeController.getAllShapes);
router.delete("/shapes/:shapeId", ShapeController.deleteShape);

// Element Routes
router.post("/elements", ElementController.addElement);
router.get("/elements/:layoutId", ElementController.getElementsByLayout);
router.delete("/elements/:elementId", ElementController.deleteElement);

export default router;
