import express from "express";

import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { addPaymentTransaction } from "../controllers/installment-payments.js";

const router = express.Router();
// /api/student-payment/payment-tabs/:studentId/make-payment
router.post(
  "/payment-tabs/:studentId/make-payment",

  authMiddleware,
  roleMiddleware("Franchise"),

  addPaymentTransaction
);

export default router;
