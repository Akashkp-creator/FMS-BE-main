import Client from "../models/Client.js";
import Franchise from "../models/Franchise.js";
import Manager from "../models/Manager.js";
// import Admin from "../models/Admin.js";
// import Manager from "../models/Manager.js";
// import Franchise from "../models/Franchise.js";
// import ChannelPartner from "../models/ChannelPartner.js";
// import User from "../models/User.js";

// export const getClientForRole = async (user) => {
//   // console.log(`this is from getClientForRole ${user}`);
//   switch (user.role) {
//     case "SuperAdmin":
//       return null;

//     // case "Admin":
//     //   return await Client.findById(user.clientId);

//     case "Admin": {
//       const client = await Client.findById(user.clientId);
//       if (!client) throw new Error("Client not found for this Admin.");

//       if (!client.isActive) {
//         throw new Error(
//           "Your institution is deactivated. Please contact SuperAdmin."
//         );
//       }

//       return client;
//     }
//     case "Manager": {
//       // Manager must belong to a Client
//       const client = await Client.findById(user.clientId);
//       if (!client) {
//         throw new Error("Client not found for this Manager.");
//       }
//       // 🔥 IMPORTANT: block manager if Client deactivated
//       if (!client.isActive) {
//         throw new Error(
//           "Your institution is deactivated. Please contact your Admin."
//         );
//       }
//       return client;
//     }

//     case "Franchise": {
//       console.log(user);
//       const client = await Client.findById(user.clientId).select(
//         "-franchiseFinance"
//       );
//       if (!client) throw new Error("Client not found for this Franchise.");

//       if (!client.isActive) {
//         throw new Error(
//           "Your institution is deactivated. Please contact Admin."
//         );
//       }
//       const franchise = await Franchise.findById(user.franchiseId);
//       console.log(franchise);

//       // return client;
//       return { client, franchise };
//     }

//     case "ChannelPartner": {
//       //   const partner = await ChannelPartner.findById(user.channelPartnerId);
//       //   if (!partner) return null;
//       //   return await Client.findById(partner.adminId);
//       const client = await Client.findById(user.clientId);
//       if (!client)
//         throw new Error("Client not found for this Channel Partner.");

//       if (!client.isActive) {
//         throw new Error(
//           "Your institution is deactivated. Please contact Admin."
//         );
//       }

//       return client;
//     }

//     default:
//       return null;
//   }
// };
export const getClientForRole = async (user) => {
  switch (user.role) {
    case "SuperAdmin":
      return { client: null, franchise: null };

    case "Admin": {
      const client = await Client.findById(user.clientId);
      if (!client) throw new Error("Client not found for this Admin.");
      if (!client.isActive) {
        throw new Error(
          "Your institution is deactivated. Please contact SuperAdmin."
        );
      }
      return { client, franchise: null };
    }

    case "Manager": {
      const client = await Client.findById(user.clientId);
      if (!client) throw new Error("Client not found for this Manager.");
      if (!client.isActive) {
        throw new Error(
          "Your institution is deactivated. Please contact your Admin."
        );
      }
      return { client, franchise: null };
    }

    case "Franchise": {
      const client = await Client.findById(user.clientId).select(
        "-franchiseFinance"
      );

      if (!client) throw new Error("Client not found for this Franchise.");
      if (!client.isActive) {
        throw new Error(
          "Your institution is deactivated. Please contact Admin."
        );
      }

      const franchise = await Franchise.findById(user.franchiseId);

      return { client, franchise };
    }

    case "ChannelPartner": {
      const client = await Client.findById(user.clientId);
      if (!client)
        throw new Error("Client not found for this Channel Partner.");
      if (!client.isActive) {
        throw new Error(
          "Your institution is deactivated. Please contact Admin."
        );
      }

      return { client, franchise: null };
    }

    default:
      return { client: null, franchise: null };
  }
};
