import Team from "../Models/Team.js";
import User from "../Models/User.js";

// Create a Team
export const createTeam = async (req, res) => {
  try {
    const { name, description, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Name and ProjectId are required",
      });
    }

    const team = await Team.create({
      name,
      description,
      project: projectId,
      adminId: req.user.id,
      members: [req.user.id],
    });

    await User.findByIdAndUpdate(req.user.id, {
      teamId: team._id,
      role: "ADMIN",
    });

    return res.status(200).json({
      success: true,
      message: "Team created Successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create a Team",
    });
  }
};

// Get all teams of a project
export const getAllTeamsOfProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const teams = await Team.find({ project: projectId })
      .populate("adminId", "name email")
      .populate("members", "name email");

    return res.status(200).json({
      success: true,
      message: "Teams fetched successfully",
      teams,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
    });
  }
};

// Get Team Details
export const getTeamDetails = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId)
      .populate("adminId", "name email")
      .populate("members", "name email")
      .populate("project", "name");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team Got Successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to find Team Details",
      error: error.message,
    });
  }
};

// Update Team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Team ID is required",
      });
    }

    const team = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      team,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Team cannot be updated. Please try again",
    });
  }
};

// Delete Team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    await Team.findByIdAndDelete(id);

    await User.updateMany(
      { teamId: id },
      { $unset: { teamId: "", role: "" } }
    );

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Team cannot be deleted.",
    });
  }
};

// Add Member
export const addMember = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (team.adminId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Admin already in team",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (team.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User already in team",
      });
    }

    team.members.push(userId);
    await team.save();

    user.teamId = teamId;
    user.role = "MEMBER";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      memberId: userId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to add member",
    });
  }
};

// Remove Member
export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    team.members.pull(memberId);
    await team.save();

    await User.findByIdAndUpdate(memberId, {
      $unset: { teamId: "" },
    });

    return res.status(200).json({
      success: true,
      message: "Member removed Successfully",
      memberId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove member",
    });
  }
};