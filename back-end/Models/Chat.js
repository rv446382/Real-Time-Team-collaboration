import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Chat", chatSchema);