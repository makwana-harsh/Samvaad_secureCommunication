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
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: "Group",
  }
);

groupSchema.index({
  visibility: 1,
});

groupSchema.index({
  adminId: 1,
});

const Group = mongoose.model("Group", groupSchema);

export default Group;