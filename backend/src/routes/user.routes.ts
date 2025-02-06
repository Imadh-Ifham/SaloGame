import express, { Router } from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { handleEmailPasswordAuth } from "../controllers/authController";
import { setSignUpFlag, setLoginFlag } from "../middleware/authMiddleware";
import { getProfile } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// Use handleEmailPasswordAuth for both register and login
router.post("/register", setSignUpFlag, handleEmailPasswordAuth);
router.post("/login", setLoginFlag, handleEmailPasswordAuth);

router.get("/", getUsers as express.RequestHandler);
router.put("/:id", updateUser as express.RequestHandler);
router.delete("/:id", deleteUser as express.RequestHandler);

router.get("/profile", authMiddleware, getProfile);

export default router;
