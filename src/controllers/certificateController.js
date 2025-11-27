// // controllers/certificateController.js
// import PDFDocument from "pdfkit";
// import axios from "axios";
// import Franchise from "../models/Franchise.js";
// import Client from "../models/Client.js";
// import Manager from "../models/Manager.js";

// // Utility to fetch image as buffer from a remote URL
// async function fetchImageBuffer(url) {
//   const res = await axios.get(url, {
//     responseType: "arraybuffer",
//     timeout: 10000,
//   });
//   return Buffer.from(res.data, "binary");
// }

// // Controller to stream PDF
// export const downloadFranchiseCertificate = async (req, res) => {
//   try {
//     const franchiseId = req.params.franchiseId;
//     console.log(franchiseId, "  <-- franchise id from frontend");

//     if (!req.user) return res.status(401).json({ message: "Unauthorized" });

//     if (req.user.role !== "Franchise")
//       return res
//         .status(403)
//         .json({ message: "Only franchise users can download certificate" });

//     // 1. Fetch franchise details
//     const franchise = await Franchise.findById(franchiseId).lean();
//     if (!franchise)
//       return res.status(404).json({ message: "Franchise not found" });

//     // Ensure they download THEIR OWN certificate
//     if (franchise._id.toString() !== franchiseId.toString()) {
//       return res
//         .status(403)
//         .json({ message: "Forbidden — not your franchise" });
//     }

//     // 2. Fetch client details
//     let client = null;
//     if (req?.user?.clientId) {
//       client = await Client.findById(req.user.clientId).lean();
//     }

//     const logoUrl = client?.logoUrl || null;
//     const institutionName =
//       client?.institutionName || "Institution name is not available";

//     const institutionAddress =
//       client?.institutionAddress || franchise.address || "";

//     // 3. Manager name (optional)
//     let managerName = "Manager";
//     if (franchise.managerId) {
//       const manager = await Manager.findById(franchise.managerId)
//         .lean()
//         .catch(() => null);
//       managerName = manager?.name || "Manager";
//     }

//     // 4. Safe file name
//     const cleanName =
//       franchise.franchiseName.replace(/\s+/g, "_") + "-certificate.pdf";

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${encodeURIComponent(cleanName)}"`
//     );

//     // 5. Create PDF
//     const doc = new PDFDocument({
//       size: "A4",
//       margin: 40,
//       bufferPages: false, // Force single page
//     });

//     doc.pipe(res);

//     const maxWidth =
//       doc.page.width - doc.page.margins.left - doc.page.margins.right;

//     // 6. Add logo if available
//     if (logoUrl) {
//       try {
//         const imgBuf = await fetchImageBuffer(logoUrl);
//         const imgWidth = 100;
//         const xpos = doc.page.width - doc.page.margins.right - imgWidth;
//         const ypos = doc.page.margins.top - 5;
//         doc.image(imgBuf, xpos, ypos, { width: imgWidth });
//       } catch (e) {
//         console.log("Logo load failed");
//       }
//     }

//     // 7. Institution Header
//     doc.fontSize(22).font("Helvetica-Bold").text(institutionName, {
//       width: maxWidth,
//     });

//     doc.moveDown(0.3);
//     doc.fontSize(10).font("Helvetica").text(institutionAddress, {
//       width: maxWidth,
//     });

//     doc.moveDown(1.4);

//     // 8. Title
//     doc
//       .fontSize(26)
//       .font("Times-Bold")
//       .fillColor("#0b3d91")
//       .text("Certificate of Accreditation", {
//         align: "center",
//         width: maxWidth,
//       });

//     doc.moveDown(1);

//     // 9. Main body text
//     const bodyText = `This is to certify that the franchise "${franchise.franchiseName}" located at "${franchise.address}" is an authorized and certified partner of ${institutionName}. The franchise is approved to offer courses and enroll students under the brand and standards of ${institutionName}.`;

//     doc.fontSize(12).font("Times-Roman").fillColor("black").text(bodyText, {
//       width: maxWidth,
//       align: "justify",
//       lineGap: 5,
//       paragraphGap: 10,
//     });

//     doc.moveDown(1);

//     // 10. Issue date
//     const issuedOn = new Date().toLocaleDateString("en-GB");
//     doc
//       .fontSize(11)
//       .font("Helvetica-Oblique")
//       .text(`Issued on: ${issuedOn}`, { align: "left" });

//     doc.moveDown(1.2);

//     // 11. Signature Box
//     const signX = doc.page.width - doc.page.margins.right - 160;
//     const y = doc.y;

//     doc
//       .fontSize(12)
//       .font("Helvetica-Bold")
//       .text("Authorized Signatory", signX, y);
//     doc
//       .fontSize(10)
//       .font("Helvetica")
//       .text(institutionName, signX, y + 18);
//     doc
//       .fontSize(10)
//       .font("Helvetica")
//       .text(`Manager: ${managerName}`, signX, y + 32);

//     // 12. Footer
//     doc
//       .moveTo(40, doc.page.height - 80)
//       .lineTo(doc.page.width - 40, doc.page.height - 80)
//       .strokeOpacity(0.1)
//       .stroke();

//     doc
//       .fontSize(9)
//       .font("Helvetica")
//       .fillColor("gray")
//       .text(
//         "This certificate is computer generated and does not require physical signature. For verification visit the official website or contact the institute.",
//         50,
//         doc.page.height - 65,
//         { width: doc.page.width - 100, align: "center" }
//       );

//     doc.end();
//   } catch (err) {
//     console.error("PDF generation error:", err);

//     if (!res.headersSent) {
//       res.status(500).json({ message: "Failed to generate certificate" });
//     } else {
//       try {
//         res.end();
//       } catch (_) {}
//     }
//   }
// };
// controllers/certificateController.js the 2nd
import PDFDocument from "pdfkit";
import axios from "axios";
import Franchise from "../models/Franchise.js";
import Client from "../models/Client.js";
import Manager from "../models/Manager.js";

// Utility to fetch image as buffer from a remote URL
async function fetchImageBuffer(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 10000,
  });
  return Buffer.from(res.data, "binary");
}

// Controller to stream PDF
export const downloadFranchiseCertificate = async (req, res) => {
  try {
    const franchiseId = req.params.franchiseId;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (req.user.role !== "Franchise")
      return res
        .status(403)
        .json({ message: "Only franchise users can download certificate" });

    // 1. Fetch franchise details
    const franchise = await Franchise.findById(franchiseId).lean();
    if (!franchise)
      return res.status(404).json({ message: "Franchise not found" });

    // Ensure they download THEIR OWN certificate
    if (franchise._id.toString() !== franchiseId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden — not your franchise" });
    }

    // 2. Fetch client details
    let client = null;
    if (req?.user?.clientId) {
      client = await Client.findById(req.user.clientId).lean();
    }

    const logoUrl = client?.logoUrl || null;
    const institutionName =
      client?.institutionName || "Institution name is not available";

    // 3. Manager name (optional)
    let managerName = "Akash";
    if (franchise.managerId) {
      const manager = await Manager.findById(franchise.managerId)
        .lean()
        .catch(() => null);
      managerName = manager?.name || "Akash";
    }

    // 4. Safe file name
    const cleanName =
      franchise.franchiseName.replace(/\s+/g, "_") + "-certificate.pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(cleanName)}"`
    );

    // 5. Create PDF in LANDSCAPE orientation
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape", // Landscape orientation
      // margin: 50,
      margin: 30,
      bufferPages: true,
    });

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const maxWidth = pageWidth - 80; // 50px margins on both sides

    // 6. Create beautiful background with gradient
    const gradient = doc.linearGradient(0, 0, pageWidth, pageHeight);
    gradient
      .stop(0, "#0f172a") // Dark blue
      .stop(0.5, "#1e293b") // Medium blue
      .stop(1, "#334155"); // Light blue

    doc.rect(0, 0, pageWidth, pageHeight).fill(gradient);

    // 7. Add glass morphism effect container
    doc.save();
    // // Outer glow effect
    // doc
    //   .roundedRect(30, 30, pageWidth - 60, pageHeight - 60, 20)
    //   .fillOpacity(0.1)
    //   .fill("white");

    // // Main glass container
    // doc
    //   .roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 15)
    //   .fillOpacity(0.15)
    //   .fill("white")
    //   .strokeOpacity(0.3)
    //   .stroke("white");

    doc.restore();

    // 8. Add decorative golden border
    doc.save();
    doc.lineWidth(3);
    const goldGradient = doc.linearGradient(0, 0, pageWidth, 0);
    goldGradient.stop(0, "#ffd700").stop(0.5, "#ffed4a").stop(1, "#ffd700");

    doc.strokeColor(goldGradient);
    doc.roundedRect(35, 35, pageWidth - 70, pageHeight - 70, 18).stroke();
    doc.restore();

    // 9. Add logo if available
    if (logoUrl) {
      try {
        const imgBuf = await fetchImageBuffer(logoUrl);
        const imgWidth = 80;
        const imgHeight = 80;
        const xpos = pageWidth - 60 - imgWidth;
        const ypos = 60;

        // Add circular container for logo
        // doc
        //   .circle(xpos - 10, ypos - 10, imgWidth / 2 + 15)
        //   .fillOpacity(0.1)
        //   .fill("white");

        doc.image(imgBuf, xpos, ypos, {
          width: imgWidth,
          height: imgHeight,
          fit: [imgWidth, imgHeight],
        });
      } catch (e) {
        console.log("Logo load failed");
      }
    }

    // 10. Institution Header with beautiful styling
    doc
      .fillColor("white")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text(institutionName, 60, 70, {
        width: maxWidth - 150,
        align: "left",
      });

    // 11. Certificate Title with golden gradient
    const titleGradient = doc.linearGradient(0, 0, 400, 0);
    titleGradient.stop(0, "#ffd700").stop(0.5, "#ffed4a").stop(1, "#ffd700");

    doc
      .fillColor(titleGradient)
      .fontSize(36)
      .font("Times-Bold")
      .text("CERTIFICATE OF ACCREDITATION", 0, 180, {
        align: "center",
        width: pageWidth,
      });

    // 12. Decorative separator
    doc
      .moveTo(100, 230)
      .lineTo(pageWidth - 100, 230)
      .lineWidth(2)
      .strokeOpacity(0.5)
      .strokeColor("#ffd700")
      .stroke();

    // 13. Main content area with beautiful typography
    const contentY = 260;
    // const contentStartY = 260; // <--- ADD OR RE-USE THIS VARIABLE
    // Franchise name with special styling
    doc
      .fillColor("#ffd700")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Franchise:", 100, contentY);

    doc
      .fillColor("white")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(franchise.franchiseName, 200, contentY);

    // Location
    doc
      .fillColor("#ffd700")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Location:", 100, contentY + 40);

    doc
      .fillColor("white")
      .fontSize(14)
      .font("Helvetica")
      .text(franchise.address, 200, contentY + 40, {
        width: maxWidth - 200,
      });

    // // 14. Certification statement
    const statement = `This is to certify that ${franchise.franchiseName} has been officially accredited as a franchise partner of ${institutionName}. This accreditation authorizes the franchise to offer courses, enroll students, and operate under the standards and brand guidelines of ${institutionName}.`;
    // ==================================================

    // ==================================================

    doc
      .fillColor("white")
      .fontSize(12)
      .font("Helvetica")
      .text(statement, 100, contentY + 100, {
        width: maxWidth - 200,
        align: "justify",
        lineGap: 8,
      });

    // 15. Issue date with beautiful styling
    const issuedOn = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fillColor("#ffd700")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Date of Issue:", 100, contentY + 180);

    doc
      .fillColor("white")
      .fontSize(12)
      .font("Helvetica")
      .text(issuedOn, 200, contentY + 180);

    // 16. Certificate ID
    doc
      .fillColor("#ffd700")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Certificate ID:", 100, contentY + 200);

    doc
      .fillColor("white")
      .fontSize(12)
      .font("Helvetica")
      .text(
        `FR-${franchise._id.toString().slice(-8).toUpperCase()}`,
        200,
        contentY + 200
      );

    // 17. Beautiful signature section
    const signatureY = contentY + 240;

    // Signature box with glass effect
    // Define new starting Y coordinate (Move UP by 20 units)
    const newSignatureY = signatureY - 20;
    // Define new X offset (Move RIGHT by 20 units)
    const xPosition = pageWidth - 270;
    doc.save();
    // doc.roundedRect(pageWidth - 300, signatureY - 20, 250, 100, 10);
    // doc
    //   .roundedRect(pageWidth - 280, newSignatureY - 20, 250, 100, 10) // Updated X and
    //   .fillOpacity(0.1)
    //   .fill("white")
    //   .strokeOpacity(0.3)
    //   .stroke("white");
    doc.restore();

    // Signature content

    // doc
    //   .fillColor("#ffd700")
    //   .fontSize(14)
    //   .font("Helvetica-Bold")
    //   .text("Authorized Signatory", pageWidth - 290, signatureY);

    // doc
    //   .fillColor("white")
    //   .fontSize(12)
    //   .font("Helvetica-Bold")
    //   .text(institutionName, pageWidth - 290, signatureY + 25);

    // doc
    //   .fillColor("white")
    //   .fontSize(11)
    //   .font("Helvetica")
    //   .text(`Manager: ${managerName}`, pageWidth - 290, signatureY + 45);
    // ========

    // Authorized Signatory
    doc
      .fillColor("#ffd700")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Authorized Signatory", xPosition, newSignatureY); // Uses new Y

    // Institution Name
    doc
      .fillColor("white")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(institutionName, xPosition, newSignatureY + 25); // Uses new Y

    // Manager Name
    doc
      .fillColor("white")
      .fontSize(11)
      .font("Helvetica")
      .text(`Manager: ${managerName}`, xPosition, newSignatureY + 45); // Uses new Y

    // 18. Add decorative elements
    // Top left decorative corner
    doc.save();
    doc
      .translate(60, 60)
      .rotate(-45)
      .fillColor("#ffd700")
      .opacity(0.3)
      .rect(-10, -10, 20, 20)
      .fill();
    doc.restore();

    // Bottom right decorative corner
    doc.save();
    doc
      .translate(pageWidth - 60, pageHeight - 60)
      .rotate(135)
      .fillColor("#ffd700")
      .opacity(0.3)
      .rect(-10, -10, 20, 20)
      .fill();
    doc.restore();

    // 19. Footer with beautiful styling
    const footerY = pageHeight - 50;

    doc
      .moveTo(80, footerY - 10)
      .lineTo(pageWidth - 80, footerY - 10)
      .lineWidth(1)
      .strokeOpacity(0.2)
      .strokeColor("white")
      .stroke();

    doc
      .fillColor("rgba(255, 255, 255, 0.7)")
      .fontSize(9)
      .font("Helvetica")
      .text(
        "This is a digitally generated certificate. For verification, please contact the institution directly.",
        80,
        footerY,
        {
          width: pageWidth - 160,
          align: "center",
        }
      );

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);

    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate certificate" });
    } else {
      try {
        res.end();
      } catch (_) {}
    }
  }
};
// the 3rd
// controllers/certificateController.js
// import PDFDocument from "pdfkit";
// import axios from "axios";
// import Franchise from "../models/Franchise.js";
// import Client from "../models/Client.js";
// import Manager from "../models/Manager.js";

// // Utility to fetch image as buffer from a remote URL
// async function fetchImageBuffer(url) {
//   const res = await axios.get(url, {
//     responseType: "arraybuffer",
//     timeout: 10000,
//   });
//   return Buffer.from(res.data, "binary");
// }

// // Controller to stream PDF
// export const downloadFranchiseCertificate = async (req, res) => {
//   try {
//     const franchiseId = req.params.franchiseId;

//     if (!req.user) return res.status(401).json({ message: "Unauthorized" });

//     if (req.user.role !== "Franchise")
//       return res
//         .status(403)
//         .json({ message: "Only franchise users can download certificate" });

//     // 1. Fetch franchise details
//     const franchise = await Franchise.findById(franchiseId).lean();
//     if (!franchise)
//       return res.status(404).json({ message: "Franchise not found" });

//     // Ensure they download THEIR OWN certificate
//     if (franchise._id.toString() !== franchiseId.toString()) {
//       return res
//         .status(403)
//         .json({ message: "Forbidden — not your franchise" });
//     }

//     // 2. Fetch client details
//     let client = null;
//     if (req?.user?.clientId) {
//       client = await Client.findById(req.user.clientId).lean();
//     }

//     const logoUrl = client?.logoUrl || null;
//     const institutionName =
//       client?.institutionName || "Institution name is not available";

//     // 3. Manager name (optional)
//     let managerName = "Manager";
//     if (franchise.managerId) {
//       const manager = await Manager.findById(franchise.managerId)
//         .lean()
//         .catch(() => null);
//       managerName = manager?.name || "Manager";
//     }

//     // 4. Safe file name
//     const cleanName =
//       franchise.franchiseName.replace(/\s+/g, "_") + "-certificate.pdf";

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${encodeURIComponent(cleanName)}"`
//     );

//     // 5. Create PDF in LANDSCAPE orientation
//     const doc = new PDFDocument({
//       size: "A4",
//       layout: "landscape",
//       margin: 30, // Reduced margins for more space
//       bufferPages: true, // Changed to true for single page control
//     });

//     doc.pipe(res);

//     const pageWidth = doc.page.width;
//     const pageHeight = doc.page.height;
//     const maxWidth = pageWidth - 60;

//     // 6. Create light background for better text visibility
//     const gradient = doc.linearGradient(0, 0, pageWidth, pageHeight);
//     gradient
//       .stop(0, "#f8fafc") // Very light gray
//       .stop(0.5, "#f1f5f9") // Light gray
//       .stop(1, "#e2e8f0"); // Medium light gray

//     doc.rect(0, 0, pageWidth, pageHeight).fill(gradient);

//     // 7. Add elegant border with gold accent
//     doc.save();
//     // Main white container with shadow effect
//     doc
//       .roundedRect(20, 20, pageWidth - 40, pageHeight - 40, 15)
//       .fill("white")
//       .stroke("#e2e8f0")
//       .strokeWidth(2);

//     // Gold inner border
//     doc
//       .roundedRect(25, 25, pageWidth - 50, pageHeight - 50, 12)
//       .stroke("#ffd700")
//       .strokeWidth(3);
//     doc.restore();

//     // 8. Add logo if available
//     if (logoUrl) {
//       try {
//         const imgBuf = await fetchImageBuffer(logoUrl);
//         const imgWidth = 70;
//         const imgHeight = 70;
//         const xpos = pageWidth - 50 - imgWidth;
//         const ypos = 40;

//         doc.image(imgBuf, xpos, ypos, {
//           width: imgWidth,
//           height: imgHeight,
//         });
//       } catch (e) {
//         console.log("Logo load failed");
//       }
//     }

//     // 9. Institution Header - DARK TEXT for visibility
//     doc
//       .fillColor("#1e293b") // Dark blue-gray
//       .fontSize(24)
//       .font("Helvetica-Bold")
//       .text(institutionName, 40, 45, {
//         width: maxWidth - 120,
//         align: "left",
//       });

//     // 10. Certificate Title with gold color
//     doc
//       .fillColor("#b45309") // Rich gold color
//       .fontSize(32)
//       .font("Times-Bold")
//       .text("CERTIFICATE OF ACCREDITATION", 0, 120, {
//         align: "center",
//         width: pageWidth,
//       });

//     // 11. Decorative golden line
//     doc
//       .moveTo(80, 160)
//       .lineTo(pageWidth - 80, 160)
//       .lineWidth(3)
//       .strokeColor("#f59e0b") // Golden yellow
//       .stroke();

//     // 12. Main content - All text in DARK colors for visibility
//     const contentStartY = 190;

//     // Franchise Information Section
//     doc
//       .fillColor("#1e293b")
//       .fontSize(16)
//       .font("Helvetica-Bold")
//       .text("This certifies that:", 80, contentStartY);

//     // Franchise Name (Prominent)
//     doc
//       .fillColor("#0f172a")
//       .fontSize(20)
//       .font("Helvetica-Bold")
//       .text(franchise.franchiseName, 80, contentStartY + 30, {
//         width: maxWidth - 80,
//       });

//     // Location
//     doc
//       .fillColor("#475569")
//       .fontSize(14)
//       .font("Helvetica")
//       .text("Located at:", 80, contentStartY + 65);

//     doc
//       .fillColor("#334155")
//       .fontSize(14)
//       .font("Helvetica-Bold")
//       .text(franchise.address, 80, contentStartY + 85, {
//         width: maxWidth - 80,
//       });

//     // 13. Accreditation Statement
//     const statement = `has been officially accredited and authorized to operate as a franchise partner of ${institutionName}. This accreditation grants the franchise rights to offer courses, enroll students, and represent the institution in accordance with established standards and guidelines.`;

//     doc
//       .fillColor("#475569")
//       .fontSize(12)
//       .font("Helvetica")
//       .text(statement, 80, contentStartY + 130, {
//         width: maxWidth - 80,
//         align: "justify",
//         lineGap: 6,
//       });

//     // 14. Certificate Details Section
//     const detailsY = contentStartY + 200;

//     // Issue Date
//     const issuedOn = new Date().toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });

//     doc
//       .fillColor("#1e293b")
//       .fontSize(12)
//       .font("Helvetica-Bold")
//       .text("Date of Issue:", 80, detailsY);

//     doc
//       .fillColor("#475569")
//       .fontSize(12)
//       .font("Helvetica")
//       .text(issuedOn, 180, detailsY);

//     // Certificate ID
//     doc
//       .fillColor("#1e293b")
//       .fontSize(12)
//       .font("Helvetica-Bold")
//       .text("Certificate ID:", 80, detailsY + 25);

//     doc
//       .fillColor("#475569")
//       .fontSize(12)
//       .font("Helvetica")
//       .text(
//         `FR-${franchise._id.toString().slice(-8).toUpperCase()}`,
//         180,
//         detailsY + 25
//       );

//     // Validity
//     doc
//       .fillColor("#1e293b")
//       .fontSize(12)
//       .font("Helvetica-Bold")
//       .text("Valid Until:", 80, detailsY + 50);

//     const validUntil = new Date();
//     validUntil.setFullYear(validUntil.getFullYear() + 1);

//     doc
//       .fillColor("#475569")
//       .fontSize(12)
//       .font("Helvetica")
//       .text(
//         validUntil.toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         180,
//         detailsY + 50
//       );

//     // 15. Signature Section - Right side
//     const signatureY = detailsY + 90;

//     // Signature box
//     doc.save();
//     doc
//       .roundedRect(pageWidth - 280, signatureY, 240, 80, 8)
//       .fill("#f8fafc")
//       .stroke("#e2e8f0")
//       .strokeWidth(1);
//     doc.restore();

//     // Signature content
//     doc
//       .fillColor("#1e293b")
//       .fontSize(14)
//       .font("Helvetica-Bold")
//       .text("Authorized Signatory", pageWidth - 270, signatureY + 15);

//     // Golden line under signature title
//     doc
//       .moveTo(pageWidth - 270, signatureY + 35)
//       .lineTo(pageWidth - 100, signatureY + 35)
//       .lineWidth(2)
//       .strokeColor("#f59e0b")
//       .stroke();

//     doc
//       .fillColor("#475569")
//       .fontSize(12)
//       .font("Helvetica-Bold")
//       .text(institutionName, pageWidth - 270, signatureY + 45);

//     doc
//       .fillColor("#64748b")
//       .fontSize(11)
//       .font("Helvetica")
//       .text(`Manager: ${managerName}`, pageWidth - 270, signatureY + 60);

//     // 16. Decorative Elements - Subtle gold accents
//     // Top left corner accent
//     doc.save();
//     doc
//       .translate(35, 35)
//       .rotate(-45)
//       .fillColor("#fef3c7") // Light gold
//       .rect(-8, -8, 16, 16)
//       .fill();
//     doc.restore();

//     // Bottom right corner accent
//     doc.save();
//     doc
//       .translate(pageWidth - 35, pageHeight - 35)
//       .rotate(135)
//       .fillColor("#fef3c7")
//       .rect(-8, -8, 16, 16)
//       .fill();
//     doc.restore();

//     // 17. Footer
//     const footerY = pageHeight - 40;

//     doc
//       .moveTo(60, footerY - 15)
//       .lineTo(pageWidth - 60, footerY - 15)
//       .lineWidth(1)
//       .strokeColor("#e2e8f0")
//       .stroke();

//     doc
//       .fillColor("#64748b")
//       .fontSize(9)
//       .font("Helvetica")
//       .text(
//         "This certificate is digitally generated and can be verified through the institution's official portal.",
//         60,
//         footerY - 10,
//         {
//           width: pageWidth - 120,
//           align: "center",
//         }
//       );

//     // 18. Ensure single page by checking if we need to add new page
//     // (PDFKit with bufferPages: true will handle this automatically)
//     if (doc.bufferedPageRange().count > 1) {
//       // Remove any additional pages to ensure single page
//       doc.flushPages();
//     }

//     doc.end();
//   } catch (err) {
//     console.error("PDF generation error:", err);

//     if (!res.headersSent) {
//       res.status(500).json({ message: "Failed to generate certificate" });
//     } else {
//       try {
//         res.end();
//       } catch (_) {}
//     }
//   }
// };
