// routes/channelPartnerRoutes.js
import express from "express";
import {
  createChannelPartner,
  getChannelPartners,
} from "../controllers/channelPartnerController.js";
import {
  authMiddleware,
  roleMiddleware,
  //   verifyManager,
} from "../middleware/auth.js";

const router = express.Router();
//    /api/channel-partner/create/channel-partner
router.post(
  "/create/channel-partner",
  authMiddleware,
  roleMiddleware("Manager"),
  createChannelPartner
);
router.get("/", authMiddleware, roleMiddleware("Manager"), getChannelPartners);

export default router;
// ⭐ Want Additional Features?

// I can also generate:

// ✅ API to list all channel partners
// ✅ API to update partner commission
// ✅ API to add student under channel partner
// ✅ API to calculate commissions
// ✅ API to track payments for ChannelPartnerStudent
