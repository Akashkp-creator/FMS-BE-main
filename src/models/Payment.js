// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    franchiseFee: {
      type: Number,
      required: true,
      min: 0,
    },

    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    extraCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    yearlyRenewalFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    netTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calc net total before save
// paymentSchema.pre("save", function (next) {
//   this.netTotal =
//     this.franchiseFee +
//     this.depositAmount +
//     this.extraCharges +
//     this.yearlyRenewalFee -
//     this.refundAmount -
//     this.discount;

//   if (this.netTotal < 0) this.netTotal = 0;

//   next();
// });

export default mongoose.model("Payment", paymentSchema);

// {
//   "franchiseFee": 50000,
//   "depositAmount": 20000,
//   "extraCharges": 5000,
//   "yearlyRenewalFee": 10000,
//   "refundAmount": 0,
//   "discount": 2000,
//   "netTotal": 83000
// }
