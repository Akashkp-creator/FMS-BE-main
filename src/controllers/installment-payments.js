export const getInstallmentPaymentsonly = async (req, res) => {
  try {
    const {
      name,
      phone,
      dueDateFrom,
      dueDateTo,
      page = 1,
      pageSize = 10,
    } = req.query;

    // Convert to numbers
    const limit = parseInt(pageSize);
    const skip = (page - 1) * limit;

    // Build match filters
    let match = {};

    if (name) {
      match.name = { $regex: name, $options: "i" };
    }

    if (phone) {
      match.phone = { $regex: phone, $options: "i" };
    }

    if (dueDateFrom || dueDateTo) {
      match["payment.installments.dueDate"] = {};

      if (dueDateFrom) {
        match["payment.installments.dueDate"].$gte = new Date(dueDateFrom);
      }

      if (dueDateTo) {
        match["payment.installments.dueDate"].$lte = new Date(dueDateTo);
      }
    }

    // Pipeline build
    const pipeline = [
      { $match: match },
      { $unwind: "$payment" },
      { $unwind: "$payment.installments" },

      {
        $project: {
          studentId: "$_id",
          studentName: "$name",
          phone: 1,
          installmentNo: "$payment.installments.installmentNo",
          dueDate: "$payment.installments.dueDate",
          amount: "$payment.installments.totalPayable",
          status: "$payment.installments.status",
        },
      },
    ];

    // Get total count BEFORE pagination
    const totalDocs = await Student.aggregate(pipeline).count("count");
    const total = totalDocs.length > 0 ? totalDocs[0].count : 0;

    // Apply pagination
    const paginatedData = await Student.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit },
    ]);

    const pageCount = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: paginatedData,
      meta: {
        page: Number(page),
        pageSize: limit,
        pageCount,
        total,
      },
    });
  } catch (err) {
    console.error("Error fetching installment payments:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};