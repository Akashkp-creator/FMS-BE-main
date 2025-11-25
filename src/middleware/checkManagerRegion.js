// // middleware/checkManagerRegion.js
// import Manager from "../models/Manager.js";

// export const checkManagerRegion = async (req, res, next) => {
//   try {
//     const { managerId } = req.user.managerId; // Or req.user.id depending on your auth
//     // const { lng, lat } = req.body; // Or req.query → depending on your request
//     const { location } = req.body;

//     if (!location || !location.coordinates) {
//       return res
//         .status(400)
//         .json({ message: "Location coordinates required." });
//     }

//     const [lng, lat] = location.coordinates;

//     if (!lng || !lat) {
//       return res
//         .status(400)
//         .json({ message: "lng and lat are required coordinates." });
//     }

//     const manager = await Manager.findById(managerId);

//     if (!manager) {
//       return res.status(404).json({ message: "Manager not found." });
//     }

//     // 1️⃣ CASE: allowedRegion = "all" → always allowed
//     if (manager.allowedRegion === "all") {
//       req.regionAllowed = true;
//       return next();
//     }

//     // 2️⃣ GeoJSON Point object
//     const point = {
//       type: "Point",
//       coordinates: [parseFloat(lng), parseFloat(lat)],
//     };

//     // 3️⃣ CASE: allowedRegion is a Polygon or MultiPolygon
//     const inside = await Manager.findOne({
//       _id: managerId,
//       allowedRegion: {
//         $geoIntersects: {
//           $geometry: point,
//         },
//       },
//     });

//     req.regionAllowed = Boolean(inside);

//     if (!inside) {
//       return res.status(403).json({
//         allowed: false,
//         message: "Point is OUTSIDE manager's allowed region.",
//       });
//     }

//     // Continue to controller
//     return next();
//   } catch (error) {
//     console.error("Region check error:", error);
//     res.status(500).json({ message: "Server error during region validation." });
//   }
// };

import Manager from "../models/Manager.js";

export const checkManagerRegion = async (req, res, next) => {
  try {
    const managerId = req.user.managerId; // ✔ auto from token
    // console.log(
    //   managerId + "this is manager id from the checkManagerRegion location "
    // );
    const { location } = req.body;

    if (!location || !location.coordinates) {
      return res
        .status(400)
        .json({ message: "Location coordinates required." });
    }

    const [lng, lat] = location.coordinates;

    const manager = await Manager.findById(managerId);

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // CASE 1️⃣: Manager allowedRegion = "all"
    if (manager.allowedRegion === "all") {
      return next();
    }

    // GeoJSON point
    const point = {
      type: "Point",
      coordinates: [lng, lat],
    };

    // CASE 2️⃣: Check if Point is inside Polygon/MultiPolygon
    const inside = await Manager.findOne({
      _id: managerId,
      allowedRegion: {
        $geoIntersects: { $geometry: point },
      },
    });

    if (!inside) {
      return res
        .status(403)
        .json({ message: "Franchise location NOT inside Manager region" });
    }

    next();
  } catch (error) {
    console.error("Region check error:", error);
    res.status(500).json({ message: "Server error during region validation" });
  }
};
