// // Add this to paymentController.js
// export const addPaymentTransaction = async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const { installmentNo, paidAmount, method, paidDate } = req.body;

//     // Validate input
//     if (!installmentNo || !paidAmount || !method) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Installment number, paid amount, and payment method are required",
//       });
//     }

//     // Find student
//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     // Find the installment
//     const payment = student.payment[0];
//     const installment = payment.installments.find(
//       (inst) => inst.installmentNo === parseInt(installmentNo)
//     );

//     if (!installment) {
//       return res.status(404).json({
//         success: false,
//         message: "Installment not found",
//       });
//     }

//     // Update installment status
//     installment.status = "paid";
//     installment.paidDate = paidDate ? new Date(paidDate) : new Date();
//     installment.paidAmount = paidAmount;

//     // Add to paidHistory
//     payment.paidHistory.push({
//       installmentNo: parseInt(installmentNo),
//       paidDate: installment.paidDate,
//       status: "Completed",
//       method: method,
//       paidAmount: paidAmount,
//     });

//     // Save the student
//     await student.save();

//     res.status(200).json({
//       success: true,
//       message: "Payment recorded successfully",
//       data: {
//         installmentNo: installmentNo,
//         paidAmount: paidAmount,
//         status: "paid",
//       },
//     });
//   } catch (error) {
//     console.error("Error adding payment:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };
