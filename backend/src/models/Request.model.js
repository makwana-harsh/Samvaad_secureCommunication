import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["friend", "group"],
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "Request",
  }
);

/*
 * Find requests received by a user,
 * especially pending requests.
 */
requestSchema.index({
  receiverId: 1,
  status: 1,
});

/*
 * Find requests sent by a user,
 * especially pending requests.
 */
requestSchema.index({
  senderId: 1,
  status: 1,
});

/*
 * Useful for finding group invitations.
 */
requestSchema.index({
  groupId: 1,
  status: 1,
});

const Request = mongoose.model("Request", requestSchema);

export default Request;