// routes/studentLeadRoutes.js
import express from "express";
// import { validateStudentData } from "../middleware/StudentDataValidater.js";
import {
  createStudent,
  getInstallmentPayments,
  getStudentById,
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
// /api/student-data/student/:studentId
router.get(
  "/student/:studentId",
  authMiddleware,
  roleMiddleware("Franchise"),
  getStudentById
);

export default router;
