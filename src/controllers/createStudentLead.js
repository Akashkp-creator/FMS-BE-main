// controllers/studentLeadController.js
import StudentLead from "../models/StudentLead.js";

export const createStudentLead = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;
    if (!franchiseId) {
      return res.status(400).json({ message: "Franchise ID missing in token" });
    }

    const {
      name,
      qualification,
      specification,
      course,
      notes,
      source,
      otherSource,
      contact,
      digitalMarketingPayment,
    } = req.body;

    // Basic required field validation
    if (!name || !qualification || !specification || !course || !source) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Additional validation for "Other" source
    if (source === "Other" && !otherSource?.trim()) {
      return res
        .status(400)
        .json({ message: "Please specify the 'Other' source" });
    }

    // Validate contact object
    if (!contact || !contact.phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Sanitize strings
    const sanitize = (v) =>
      typeof v === "string" ? v.trim().replace(/<[^>]*>?/gm, "") : v;

    const leadData = {
      franchiseId,
      name: sanitize(name),
      qualification: sanitize(qualification),
      specification: sanitize(specification),
      course: sanitize(course),
      notes: sanitize(notes),
      source: sanitize(source),
      otherSource: sanitize(otherSource),

      contact: {
        phone: sanitize(contact.phone),
        email: sanitize(contact.email),
      },
    };

    // If digital marketing data exists
    if (digitalMarketingPayment?.amount) {
      leadData.digitalMarketingPayment = {
        amount: Number(digitalMarketingPayment.amount),
        paidTo: sanitize(digitalMarketingPayment.paidTo),
        date:
          digitalMarketingPayment.date ||
          new Date().toISOString().split("T")[0],
      };
    }

    const newLead = await StudentLead.create(leadData);
    // await StudentLead.create(leadData);

    return res.status(201).json({
      message: "Lead created successfully",
      data: newLead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// controllers/studentLeadController.js

export const getStudentLeads = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId; // From auth middleware

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID missing from token",
      });
    }

    // -------------------------
    //   QUERY PARAMETERS
    // -------------------------
    const {
      name,
      status,
      phone,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 10,
    } = req.query;

    const filter = { franchiseId };

    // -------------------------
    //   APPLY FILTERS
    // -------------------------

    // Name search (case-insensitive)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // Status filter
    if (status) {
      filter.status = status;
    }
    // Phone filter (nested field)
    if (phone) {
      filter["contact.phone"] = { $regex: phone, $options: "i" };
    }

    // Date Range filter (createdAt)
    if (dateFrom || dateTo) {
      filter.createdAt = {};

      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Include full end day
        filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
      }
    }

    // -------------------------
    //   PAGINATION
    // -------------------------
    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // Count total items
    const total = await StudentLead.countDocuments(filter);

    // Fetch documents
    const leads = await StudentLead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pageCount = Math.ceil(total / pageSize);

    // -------------------------
    //   RESPONSE
    // -------------------------
    return res.status(200).json({
      success: true,
      data: leads,
      meta: {
        page: Number(page),
        pageSize: Number(pageSize),
        pageCount,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching student leads:", error);

    return res.status(500).json({
      success: false,
      message: "Server error. Could not fetch leads.",
    });
  }
};

// to add the followups
// import StudentLead from "../models/StudentLead.js";

export const addFollowUpNote = async (req, res) => {
  try {
    const { id } = req.params; // Lead ID
    const { note } = req.body; // Only note sent from frontend

    if (!note || note.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    // Generate date & formatted time
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newFollowUp = {
      date: now,
      time: formattedTime,
      note: note.trim(),
    };

    // Push to array
    const updatedLead = await StudentLead.findByIdAndUpdate(
      id,
      { $push: { followUpNote: newFollowUp } },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: "Student lead not found",
      });
    }

    res.json({
      success: true,
      message: "Follow-up note added successfully",
      // data: updatedLead,
    });
  } catch (error) {
    console.error("Error adding follow-up note:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// to get the follow up history
// import StudentLead from "../models/StudentLead.js";

export const getFollowUpNotes = async (req, res) => {
  try {
    const { id } = req.params; // leadId

    const lead = await StudentLead.findById(id).select("followUpNote");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Sort follow-up notes by date (latest first)
    const sortedNotes = [...lead.followUpNote].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return res.status(200).json({
      success: true,
      message: "Follow-up notes fetched successfully",
      notes: sortedNotes,
    });
  } catch (error) {
    console.error("Get Follow-Up Notes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// to know the reason why the student has rejected
// import StudentLead from "../models/StudentLead.js";

export const rejectStudentLead = async (req, res) => {
  try {
    const { id } = req.params; // student lead ID
    const { reason } = req.body;

    // Validate: reason is required
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Reason is required to mark the lead as Rejected",
      });
    }

    // Validate: length (max 200 chars recommended)
    if (reason.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Reason must not exceed 200 characters",
      });
    }

    // Fetch lead
    const lead = await StudentLead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Student lead not found",
      });
    }

    // Update fields
    lead.status = "Rejected"; // Update status
    lead.reason = reason.trim(); // Save reason

    await lead.save();

    return res.status(200).json({
      success: true,
      message: "Lead marked as Rejected successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Reject Student Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
