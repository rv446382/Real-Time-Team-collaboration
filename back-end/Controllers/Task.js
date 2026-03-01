import User from "../Models/User.js";
import Project from "../Models/Project.js";
import Task from "../Models/Task.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../Validations/taskValidation.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    let { title, description, status, projectId, assignedTo } = req.body;
    const createdBy = req.user.id;

    const { error } = createTaskSchema.validate({
      title,
      description,
      projectId,
      assignedTo,
    });

    status = status || "todo";

    if (error) {
      return res.status(403).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      createdBy,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Task cannot be created. Please try again",
    });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const { status } = req.body;

    const { error } = updateTaskSchema.validate({ status });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const task = await Task.findById(req.params.id).populate({
      path: "projectId",
      match: { teamId: req.user.teamId },
    });

    if (!task || !task.projectId) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Task cannot be updated. Please try again",
    });
  }
};

// Assign Task
export const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true }
    ).populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Task cannot be assigned. Please try again",
    });
  }
};

// Get All Tasks
export const getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(403).json({
        success: false,
        message: "Project id is required",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      teamId: req.user.teamId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const tasks = await Task.find({ projectId }).populate(
      "assignedTo",
      "name email"
    );

    return res.status(200).json({
      success: true,
      message: "Successfully got all tasks",
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks. Please try again",
    });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId).populate({
      path: "projectId",
      match: { teamId: req.user.teamId },
    });

    if (!task || !task.projectId) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      message: "Task cannot be deleted. Please try again",
    });
  }
};