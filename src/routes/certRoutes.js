import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { downloadFranchiseCertificate } from "../controllers/certificateController.js";
// import { downloadFranchiseCertificate } from "../controllers/certificateController.js";
// import { authenticateJWT } from "../middleware/auth.js"; // your auth middleware

const router = express.Router();

// GET /api/franchise/certificate

router.get(
  "/franchise/certificate/:franchiseId",
  authMiddleware,
  roleMiddleware("Franchise"),
  downloadFranchiseCertificate
);

export default router;
