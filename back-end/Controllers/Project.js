import Project from "../Models/Project.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../Validations/ProjectValidation.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const { error } = createProjectSchema.validate({ name, description });
    if (error) {
      return res.status(403).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const project = await Project.create({
      name,
      description,
      teamId: req.user.teamId,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const { error } = updateProjectSchema.validate({ name, description });
    if (error) {
      return res.status(403).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, teamId: req.user.teamId },
      { name, description },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Project cannot be updated. Please try again",
    });
  }
};

// Delete Project
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findOneAndDelete({
      _id: projectId,
      teamId: req.user.teamId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Project cannot be deleted. Please try again",
    });
  }
};

// Get All Projects
export const getProject = async (req, res) => {
  try {
    const projects = await Project.find({
      teamId: req.user.teamId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: projects,
      message: "Projects received successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve projects",
      error: error.message,
    });
  }
};

// Get Single Project
export const getSingleProject = async (req, res) => {
  try {
    const projectId = req.params.id;

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

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project. Please try again",
    });
  }
};