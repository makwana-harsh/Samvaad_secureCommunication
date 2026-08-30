import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: null,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      required: true,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "Group",
  }
);

/*
 * Used when discovering public groups.
 */
groupSchema.index({
  visibility: 1,
});

/*
 * Useful when finding groups created by an admin.
 */
groupSchema.index({
  adminId: 1,
});

const Group = mongoose.model("Group", groupSchema);

export default Group;