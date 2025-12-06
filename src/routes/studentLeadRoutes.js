// routes/studentLeadRoutes.js
import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import {
  addFollowUpNote,
  createStudentLead,
  getFollowUpNotes,
  getStudentLeads,
  rejectStudentLead,
} from "../controllers/createStudentLead.js";
// import { createStudentLead } from "../controllers/studentLeadController.js";
// import authMiddleware from "../middleware/auth.js";

const router = express.Router();
//              /api/LeadStudentData/student-leadList/my-leads
router.post(
  "/create-studentLead",
  authMiddleware,
  roleMiddleware("Franchise"),
  createStudentLead
);
// /LeadStudentData/lead/:id/followup
router.get(
  "/student-leadList/my-leads",
  authMiddleware,
  roleMiddleware("Franchise"),
  getStudentLeads
);
// /api/LeadStudentData/lead/:selectedLeadId/followup
router.put("/lead/:id/followup", addFollowUpNote);
//to get the follow ups
router.get("/lead/:id/followup", getFollowUpNotes);
// reason route   /LeadStudentData/lead/:id/reject
router.put("/lead/:id/reject", rejectStudentLead);

export default router;
