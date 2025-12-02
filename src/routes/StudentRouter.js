// routes/studentLeadRoutes.js
import express from "express";
// import { validateStudentData } from "../middleware/StudentDataValidater.js";
import {
  createStudent,
  getInstallmentPayments,
  // debugCreateStudent,
} from "../controllers/StudentController.js";
// import { validateStudentData } from "../middleware/StudentDataValidater.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = express.Router();
//      /api/student-data/Franchise-add/my-StudentLead/:studentLeadId
// routes/student.js
router.post(
  "/Franchise-add/my-StudentLead/:studentLeadId",
  //   validateStudentData,

  authMiddleware,
  roleMiddleware("Franchise"),
  // debugCreateStudent,
  createStudent
);
router.get(
  "/Franchise/my-Student/paymentList",
  //   validateStudentData,

  authMiddleware,
  roleMiddleware("Franchise"),
  // debugCreateStudent,
  getInstallmentPayments
);

export default router;
