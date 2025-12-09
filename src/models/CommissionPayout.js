import mongoose from "mongoose";

const commissionPayoutSchema = new mongoose.Schema(
  {
    channelPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
      required: true,
    },

    amountPaid: {
      type: Number,
      required: true,
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Other"],
      default: "Cash",
    },

    // note: {
    //   type: String,
    //   trim: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("CommissionPayout", commissionPayoutSchema);
