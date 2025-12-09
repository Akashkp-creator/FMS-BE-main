import ChannelPartnerStudent from "../models/ChannelPartnerStudent.js";
import ChannelPartner from "../models/ChannelPartner.js";
// import CommissionPayout from "../models/CommissionPayout.js";

// export const addPaymentToChannelPartnerStudent = async (req, res) => {
//   try {
//     const managerId = req.user.managerId; // From auth middleware
//     const receivedBy = req.user.name;
//     const { studentId } = req.params;
//     const { amount, mode } = req.body;

//     // Validation
//     if (!amount || !mode) {
//       return res.status(400).json({
//         message: "Amount and payment mode are required.",
//         success: false,
//       });
//     }

//     // Get student
//     const student = await ChannelPartnerStudent.findOne({
//       _id: studentId,
//       managerId,
//     });

//     if (!student) {
//       return res.status(404).json({
//         message: "Student not found or not assigned to manager.",
//         success: false,
//       });
//     }

//     // Get Channel Partner
//     const partner = await ChannelPartner.findOne({
//       _id: student.channelPartnerId,
//       managerId,
//     });

//     if (!partner) {
//       return res.status(404).json({
//         message: "Channel Partner not found.",
//         success: false,
//       });
//     }

//     // New payment object
//     const paymentObj = {
//       amount,
//       mode,
//       receivedBy: receivedBy || "Manager",
//     };

//     // Push to payments array
//     student.payments.push(paymentObj);

//     // Update total paid
//     student.totalPaid += amount;

//     // Save student
//     await student.save();

//     // // 💰 Commission logic

//     // 1. Fetch all students linked with this Channel Partner
//     const allStudents = await ChannelPartnerStudent.find({
//       channelPartnerId: partner._id,
//     });

//     // 2. Sum totalPaid of all students
//     const totalPaidAcrossStudents = allStudents.reduce(
//       (sum, s) => sum + s.totalPaid,
//       0
//     );

//     // 3. Calculate total commission
//     const commissionPercent = partner.commissionPercent / 100;
//     const totalCommissionEarned = totalPaidAcrossStudents * commissionPercent;

//     // 4. Update partner fields
//     partner.totalCommissionEarned = totalCommissionEarned;

//     // 4B. Calculate total payout from CommissionPayout table
//     const payoutRecords = await CommissionPayout.aggregate([
//       { $match: { channelPartnerId: partner._id } },
//       { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
//     ]);

//     const totalCommissionPaid =
//       payoutRecords.length > 0 ? payoutRecords[0].totalPaid : 0;

//     partner.totalCommissionPaid = totalCommissionPaid;

//     // 5. pending = earned - paid
//     partner.pendingCommission = totalCommissionEarned - totalCommissionPaid;

//     await partner.save();

//     return res.status(200).json({
//       message: "Payment added successfully.",
//     });
//   } catch (error) {
//     console.error("Add Payment Error:", error);
//     return res.status(500).json({
//       message: "Internal Server Error",
//       success: false,
//       error: error.message,
//     });
//   }
// };
// Final api
export const addPaymentToChannelPartnerStudent = async (req, res) => {
  try {
    const managerId = req.user.managerId;
    const receivedBy = req.user.name;
    const { studentId } = req.params;
    const { amount, mode } = req.body;

    // -----------------------------------
    // Basic Validation
    // -----------------------------------
    if (!amount || !mode) {
      return res.status(400).json({
        message: "Amount and payment mode are required.",
        success: false,
      });
    }

    // -----------------------------------
    // 1. Fetch Student
    // -----------------------------------
    const student = await ChannelPartnerStudent.findOne({
      _id: studentId,
      managerId,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found or not assigned to manager.",
        success: false,
      });
    }

    // -----------------------------------
    // 2. Fetch Partner
    // -----------------------------------
    const partner = await ChannelPartner.findOne({
      _id: student.channelPartnerId,
      managerId,
    });

    if (!partner) {
      return res.status(404).json({
        message: "Channel Partner not found.",
        success: false,
      });
    }

    // -----------------------------------
    // 3. Add Payment to Student
    // -----------------------------------
    const paymentObj = {
      amount,
      mode,
      receivedBy: receivedBy || "Manager",
    };

    student.payments.push(paymentObj);
    student.totalPaid += amount;

    await student.save();

    // -----------------------------------
    // 4. Recalculate Multi-Student Commission
    // -----------------------------------

    // Fetch all students of this partner
    const allStudents = await ChannelPartnerStudent.find({
      channelPartnerId: partner._id,
    });

    // Sum all totalPaid
    const totalPaidAcrossStudents = allStudents.reduce(
      (sum, s) => sum + s.totalPaid,
      0
    );

    // Commission calculation
    const commissionPercent = partner.commissionPercent / 100;
    const totalCommissionEarned = totalPaidAcrossStudents * commissionPercent;

    partner.totalCommissionEarned = totalCommissionEarned;

    // -----------------------------------
    // 5. SUM of all payouts from CommissionPayout table
    // -----------------------------------
    const payoutRecords = await CommissionPayout.aggregate([
      { $match: { partnerId: partner._id } },
      { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
    ]);

    const totalCommissionPaid =
      payoutRecords.length > 0 ? payoutRecords[0].totalPaid : 0;

    partner.totalCommissionPaid = totalCommissionPaid;

    // pending commission
    partner.pendingCommission = totalCommissionEarned - totalCommissionPaid;

    await partner.save();

    // -----------------------------------
    // Response
    // -----------------------------------
    return res.status(200).json({
      message: "Payment added successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Add Payment Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// corrected api
// export const addPaymentToChannelPartnerStudent = async (req, res) => {
//   try {
//     const managerId = req.user.managerId;
//     const receivedBy = req.user.name;
//     const { studentId } = req.params;
//     const { amount, mode } = req.body;

//     // Validation
//     if (!amount || !mode) {
//       return res.status(400).json({
//         message: "Amount and payment mode are required.",
//         success: false,
//       });
//     }

//     // Get student
//     const student = await ChannelPartnerStudent.findOne({
//       _id: studentId,
//       managerId,
//     });

//     if (!student) {
//       return res.status(404).json({
//         message: "Student not found or not assigned to manager.",
//         success: false,
//       });
//     }

//     // Get Channel Partner
//     const partner = await ChannelPartner.findOne({
//       _id: student.channelPartnerId,
//       managerId,
//     });

//     if (!partner) {
//       return res.status(404).json({
//         message: "Channel Partner not found.",
//         success: false,
//       });
//     }

//     // Create payment object
//     const paymentObj = {
//       amount,
//       mode,
//       receivedBy: receivedBy || "Manager",
//     };

//     // Add payment to student
//     student.payments.push(paymentObj);
//     student.totalPaid += amount;
//     await student.save();

//     // -----------------------------
//     // MULTI-STUDENT COMMISSION CALCULATION (CORRECT)
//     // -----------------------------

//     // Get all students assigned to this partner
//     const allStudents = await ChannelPartnerStudent.find({
//       channelPartnerId: partner._id,
//     });

//     // Total paid across ALL students
//     const totalPaidAcrossStudents = allStudents.reduce(
//       (sum, s) => sum + s.totalPaid,
//       0
//     );

//     // Commission calculation
//     const commissionPercent = partner.commissionPercent / 100;
//     const totalCommissionEarned = totalPaidAcrossStudents * commissionPercent;

//     // Update partner data
//     partner.totalCommissionEarned = totalCommissionEarned;

//     partner.pendingCommission =
//       totalCommissionEarned - partner.totalCommissionPaid;

//     await partner.save();

//     return res.status(200).json({
//       message: "Payment added successfully.",
//     });
//   } catch (error) {
//     console.error("Add Payment Error:", error);
//     return res.status(500).json({
//       message: "Internal Server Error",
//       success: false,
//       error: error.message,
//     });
//   }
// };

// controllers/channelPartnerController.js

// import ChannelPartner from "../models/ChannelPartner.js";
import CommissionPayout from "../models/CommissionPayout.js";

export const payCommissionToPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { amount, paymentMode } = req.body;

    // validate
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const partner = await ChannelPartner.findOne({
      _id: partnerId,
      managerId: req.user.managerID, // only own partners
    });

    if (!partner) {
      return res.status(404).json({ message: "Channel Partner not found" });
    }

    if (amount > partner.pendingCommission) {
      return res.status(400).json({
        message: `Cannot pay more than pending commission. Pending: ${partner.pendingCommission}`,
      });
    }

    // Update partner commission values
    partner.pendingCommission -= amount;
    partner.totalCommissionPaid += amount;

    await partner.save();

    // Save payout history
    await CommissionPayout.create({
      channelPartnerId: partnerId,
      managerId: req.user.managerID,
      amountPaid: amount,
      paymentMode: paymentMode || "Cash",
      // note: note || "",
    });

    return res.status(200).json({
      message: "Commission paid successfully",
      data: partner,
    });
  } catch (error) {
    console.error("Commission Pay Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// routes/channelPartnerRoutes.js

// import express from "express";
// import { payCommissionToPartner } from "../controllers/channelPartnerController.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post(
//   "/pay-commission/:partnerId",
//   authMiddleware,
//   payCommissionToPartner
// );

// export default router;
