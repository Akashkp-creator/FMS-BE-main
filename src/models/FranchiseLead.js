import mongoose from "mongoose";

const franchiseLeadSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerEmail: {
      type: String,
      required: true,
      unique: true, // <--- **Add this line**
      lowercase: true,
      trim: true,
    },
    // ... rest of your schema
    ownerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "New",
        "In Progress",
        "Interested",
        "Not Interested",
        "Closed",
        "Enrolled",
      ],
      default: "New",
    },
    reason: {
      type: String,
      default: null,
      trim: true,
    },

    notes: [
      {
        date: {
          type: Date,
          default: Date.now, // auto timestamp
        },
        time: {
          type: String, // "03:45 PM"
          required: true,
        },
        note: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);
franchiseLeadSchema.pre("validate", function (next) {
  if (
    this.status === "Not Interested" &&
    (!this.reason || this.reason.trim() === "")
  ) {
    return next(
      new Error("Reason is required when marking a lead as Not Interested")
    );
  }
  next();
});

export default mongoose.model("FranchiseLead", franchiseLeadSchema);
