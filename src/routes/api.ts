import express from 'express';
import authController from "../controller/auth.controller";

const router = express.Router();


// router.post("/auth/register", authController.register);
router.post("/auth/register", authController.register)

export default router;