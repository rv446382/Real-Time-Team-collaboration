import Chat from "../Models/Chat.js";

export const getMessages = async (req, res) => {
  const { projectId, teamId, receiverId, senderId } = req.query;

  try {
    let filter = {};

    if (projectId) {
      filter.projectId = projectId;
    } else if (teamId) {
      filter.teamId = teamId;
    } else if (receiverId && senderId) {
      filter = {
        $or: [
          { sender: senderId, receiverId: receiverId },
          { sender: receiverId, receiverId: senderId },
        ],
      };
    }

    const messages = await Chat.find(filter)
      .populate("sender", "name email role")
      .sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};