// workExperienceController.js - Controller for work experience management
import { database_pool } from '../config/dbconnection.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add a new work experience entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addWorkExperience = async (req, res) => {
  const { 
    freelancerId, 
    projectTitle, 
    description, 
    clientName, 
    completionDate, 
    skillsUsed 
  } = req.body;

  // Validate required fields
  if (!freelancerId || !projectTitle) {
    return res.status(400).json({ 
      success: false, 
      message: 'Freelancer ID and Project Title are required' 
    });
  }

  try {
    // Check if freelancer exists
    const [freelancerRows] = await database_pool.query(
      'SELECT Id FROM freelancers WHERE Id = ?',
      [freelancerId]
    );

    if (freelancerRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Freelancer not found' 
      });
    }

    // Check if freelancer already has 3 work experiences
    const [countRows] = await database_pool.query(
      'SELECT COUNT(*) as count FROM work_experience WHERE Freelancer_Id = ?',
      [freelancerId]
    );

    if (countRows[0].count >= 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum of 3 work experiences allowed per freelancer' 
      });
    }

    // Insert new work experience
    const [result] = await database_pool.query(
      `INSERT INTO work_experience 
      (Freelancer_Id, Project_Title, Description, Client_Name, Completion_Date, Skills_Used) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        freelancerId, 
        projectTitle, 
        description || null, 
        clientName || null, 
        completionDate || null, 
        skillsUsed || null
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Work experience added successfully', 
      workExperienceId: result.insertId 
    });
  } catch (error) {
    console.error('Error adding work experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add work experience', 
      error: error.message 
    });
  }
};

/**
 * Update an existing work experience entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateWorkExperience = async (req, res) => {
  const { id } = req.params;
  const { 
    projectTitle, 
    description, 
    clientName, 
    completionDate, 
    skillsUsed 
  } = req.body;

  // Validate required fields
  if (!projectTitle) {
    return res.status(400).json({ 
      success: false, 
      message: 'Project Title is required' 
    });
  }

  try {
    // Check if work experience exists
    const [rows] = await database_pool.query(
      'SELECT * FROM work_experience WHERE Id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work experience not found' 
      });
    }

    // Update work experience
    await database_pool.query(
      `UPDATE work_experience 
      SET Project_Title = ?, Description = ?, Client_Name = ?, 
      Completion_Date = ?, Skills_Used = ? 
      WHERE Id = ?`,
      [
        projectTitle, 
        description || null, 
        clientName || null, 
        completionDate || null, 
        skillsUsed || null, 
        id
      ]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Work experience updated successfully' 
    });
  } catch (error) {
    console.error('Error updating work experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update work experience', 
      error: error.message 
    });
  }
};

/**
 * Delete a work experience entry and its associated images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteWorkExperience = async (req, res) => {
  const { id } = req.params;

  try {
    // Get image URLs before deleting to remove files from disk
    const [imageRows] = await database_pool.query(
      'SELECT Image_Url FROM work_experience_images WHERE Work_Experience_Id = ?',
      [id]
    );

    // Check if work experience exists
    const [rows] = await database_pool.query(
      'SELECT * FROM work_experience WHERE Id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work experience not found' 
      });
    }

    // Delete work experience (cascade will delete images from database)
    await database_pool.query(
      'DELETE FROM work_experience WHERE Id = ?',
      [id]
    );

    // Delete image files from disk
    const workExperienceImagesDir = path.join(__dirname, '../assets/workExperienceImages');
    imageRows.forEach(image => {
      const imageName = path.basename(image.Image_Url);
      const imagePath = path.join(workExperienceImagesDir, imageName);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Work experience deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete work experience', 
      error: error.message 
    });
  }
};

/**
 * Get a specific work experience by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getWorkExperienceById = async (req, res) => {
  const { id } = req.params;

  try {
    // Get work experience details
    const [rows] = await database_pool.query(
      `SELECT * FROM work_experience WHERE Id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work experience not found' 
      });
    }

    // Get associated images
    const [imageRows] = await database_pool.query(
      `SELECT Id, Image_Url, Is_Primary, Created_At 
      FROM work_experience_images 
      WHERE Work_Experience_Id = ?`,
      [id]
    );

    // Format the response
    const workExperience = {
      ...rows[0],
      images: imageRows.map(img => ({
        id: img.Id,
        imageUrl: img.Image_Url,
        isPrimary: Boolean(img.Is_Primary),
        createdAt: img.Created_At
      }))
    };

    res.status(200).json({ 
      success: true, 
      workExperience 
    });
  } catch (error) {
    console.error('Error fetching work experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work experience', 
      error: error.message 
    });
  }
};

/**
 * Get all work experiences for a specific freelancer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getWorkExperienceByFreelancer = async (req, res) => {
  const { freelancerId } = req.params;

  try {
    // Get all work experiences for the freelancer
    const [rows] = await database_pool.query(
      `SELECT * FROM work_experience WHERE Freelancer_Id = ? ORDER BY Completion_Date DESC`,
      [freelancerId]
    );

    // Get all associated images in a single query
    const [imageRows] = await database_pool.query(
      `SELECT wei.Id, wei.Work_Experience_Id, wei.Image_Url, wei.Is_Primary, wei.Created_At 
      FROM work_experience_images wei
      JOIN work_experience we ON wei.Work_Experience_Id = we.Id
      WHERE we.Freelancer_Id = ?`,
      [freelancerId]
    );

    // Group images by work experience ID
    const imagesByWorkExperience = {};
    imageRows.forEach(img => {
      if (!imagesByWorkExperience[img.Work_Experience_Id]) {
        imagesByWorkExperience[img.Work_Experience_Id] = [];
      }
      imagesByWorkExperience[img.Work_Experience_Id].push({
        id: img.Id,
        imageUrl: img.Image_Url,
        isPrimary: Boolean(img.Is_Primary),
        createdAt: img.Created_At
      });
    });

    // Format the response
    const workExperiences = rows.map(we => ({
      ...we,
      images: imagesByWorkExperience[we.Id] || []
    }));

    res.status(200).json({ 
      success: true, 
      workExperiences 
    });
  } catch (error) {
    console.error('Error fetching freelancer work experiences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work experiences', 
      error: error.message 
    });
  }
};

/**
 * Upload images for a work experience
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadWorkExperienceImages = async (req, res) => {
  const { workExperienceId } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'No images uploaded' 
    });
  }

  try {
    // Check if work experience exists
    const [rows] = await database_pool.query(
      'SELECT * FROM work_experience WHERE Id = ?',
      [workExperienceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work experience not found' 
      });
    }

    // Check how many images already exist for this work experience
    const [countRows] = await database_pool.query(
      'SELECT COUNT(*) as count FROM work_experience_images WHERE Work_Experience_Id = ?',
      [workExperienceId]
    );

    const existingImageCount = countRows[0].count;
    const maxAllowedImages = 5;

    if (existingImageCount + files.length > maxAllowedImages) {
      return res.status(400).json({ 
        success: false, 
        message: `Maximum of ${maxAllowedImages} images allowed per work experience. You can upload ${maxAllowedImages - existingImageCount} more.` 
      });
    }

    // Check if there's already a primary image
    const [primaryRows] = await database_pool.query(
      'SELECT COUNT(*) as count FROM work_experience_images WHERE Work_Experience_Id = ? AND Is_Primary = true',
      [workExperienceId]
    );

    const hasPrimaryImage = primaryRows[0].count > 0;

    // Insert image records
    const insertedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = `/assets/workExperienceImages/${file.filename}`;
      
      // Set the first image as primary if no primary image exists
      const isPrimary = !hasPrimaryImage && i === 0;
      
      const [result] = await database_pool.query(
        'INSERT INTO work_experience_images (Work_Experience_Id, Image_Url, Is_Primary) VALUES (?, ?, ?)',
        [workExperienceId, imageUrl, isPrimary]
      );

      insertedImages.push({
        id: result.insertId,
        imageUrl,
        isPrimary,
        filename: file.filename
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Images uploaded successfully', 
      images: insertedImages 
    });
  } catch (error) {
    console.error('Error uploading work experience images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload images', 
      error: error.message 
    });
  }
};

/**
 * Delete a work experience image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteWorkExperienceImage = async (req, res) => {
  const { imageId } = req.params;

  try {
    // Get image details
    const [imageRows] = await database_pool.query(
      'SELECT * FROM work_experience_images WHERE Id = ?',
      [imageId]
    );

    if (imageRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    const image = imageRows[0];
    const isPrimary = Boolean(image.Is_Primary);
    const workExperienceId = image.Work_Experience_Id;

    // Delete image from database
    await database_pool.query(
      'DELETE FROM work_experience_images WHERE Id = ?',
      [imageId]
    );

    // Delete image file from disk
    const imageName = path.basename(image.Image_Url);
    const imagePath = path.join(__dirname, '../assets/workExperienceImages', imageName);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // If the deleted image was primary, set another image as primary
    if (isPrimary) {
      const [remainingImages] = await database_pool.query(
        'SELECT Id FROM work_experience_images WHERE Work_Experience_Id = ? LIMIT 1',
        [workExperienceId]
      );

      if (remainingImages.length > 0) {
        await database_pool.query(
          'UPDATE work_experience_images SET Is_Primary = true WHERE Id = ?',
          [remainingImages[0].Id]
        );
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting work experience image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete image', 
      error: error.message 
    });
  }
};

/**
 * Set an image as the primary image for a work experience
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const setPrimaryImage = async (req, res) => {
  const { imageId } = req.params;

  try {
    // Get image details
    const [imageRows] = await database_pool.query(
      'SELECT * FROM work_experience_images WHERE Id = ?',
      [imageId]
    );

    if (imageRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    const workExperienceId = imageRows[0].Work_Experience_Id;

    // Clear primary flag from all images for this work experience
    await database_pool.query(
      'UPDATE work_experience_images SET Is_Primary = false WHERE Work_Experience_Id = ?',
      [workExperienceId]
    );

    // Set this image as primary
    await database_pool.query(
      'UPDATE work_experience_images SET Is_Primary = true WHERE Id = ?',
      [imageId]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Primary image set successfully' 
    });
  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to set primary image', 
      error: error.message 
    });
  }
};
