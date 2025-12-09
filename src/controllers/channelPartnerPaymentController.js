import ChannelPartnerStudent from "../models/ChannelPartnerStudent.js";
import ChannelPartner from "../models/ChannelPartner.js";

export const addPaymentToChannelPartnerStudent = async (req, res) => {
  try {
    const managerId = req.user.managerId; // From auth middleware
    const receivedBy = req.user.name;
    const { studentId } = req.params;
    const { amount, mode } = req.body;

    // Validation
    if (!amount || !mode) {
      return res.status(400).json({
        message: "Amount and payment mode are required.",
        success: false,
      });
    }

    // Get student
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

    // Get Channel Partner
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

    // New payment object
    const paymentObj = {
      amount,
      mode,
      receivedBy: receivedBy || "Manager",
    };

    // Push to payments array
    student.payments.push(paymentObj);

    // Update total paid
    student.totalPaid += amount;

    // Save student
    await student.save();

    // // 💰 Commission logic
    // const commissionPercent = partner.commissionPercent / 100;
    // const commissionEarned = amount * commissionPercent;

    // // Update Channel Partner commission data
    // partner.totalCommissionEarned += commissionEarned;
    // partner.pendingCommission += commissionEarned;

    // await partner.save();
    // -----------------------------
    // FIXED COMMISSION CALCULATION
    // -----------------------------
    // ❗ commissionPercent must NEVER change
    // commission = totalPaid * (commissionPercent / 100)

    // const commissionPercent = partner.commissionPercent / 100;

    // const updatedCommissionEarned = student.totalPaid * commissionPercent;

    // // Update partner commission values (recalculated, not incremented)
    // partner.totalCommissionEarned = updatedCommissionEarned;

    // // 🔥 pendingCommission should not be fully replaced
    // // It will be updated via a separate API (payout API)
    // partner.pendingCommission =
    //   updatedCommissionEarned - partner.totalCommissionPaid;

    // await partner.save();
    // -----------------------------
    // CORRECT MULTI-STUDENT COMMISSION CALCULATION
    // -----------------------------

    // 1. Fetch all students linked with this Channel Partner
    const allStudents = await ChannelPartnerStudent.find({
      channelPartnerId: partner._id,
    });

    // 2. Sum totalPaid of all students
    const totalPaidAcrossStudents = allStudents.reduce(
      (sum, s) => sum + s.totalPaid,
      0
    );

    // 3. Calculate total commission
    const commissionPercent = partner.commissionPercent / 100;
    const totalCommissionEarned = totalPaidAcrossStudents * commissionPercent;

    // 4. Update partner fields
    partner.totalCommissionEarned = totalCommissionEarned;

    // pending = total earned - already paid
    partner.pendingCommission =
      totalCommissionEarned - partner.totalCommissionPaid;

    await partner.save();

    return res.status(200).json({
      message: "Payment added successfully.",
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
