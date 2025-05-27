// workExperienceController.js
import { database_pool } from '../config/dbconnection.js';
import { getWorkExperienceImageUrl } from '../config/multerConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get work experience entries for a freelancer
 */
export const getWorkExperience = async (req, res) => {
  const { freelancerId } = req.query;
  
  if (!freelancerId) {
    return res.status(400).json({ error: 'Freelancer ID is required' });
  }
  
  const query = `
    SELECT we.*, 
           (SELECT COUNT(*) FROM work_experience_images WHERE Work_Experience_Id = we.Id) AS imageCount
    FROM work_experience we
    WHERE we.Freelancer_Id = ?
    ORDER BY we.Completion_Date DESC, we.Created_At DESC
  `;
  
  try {
    const [results] = await database_pool.query(query, [freelancerId]);
    
    if (results.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get all work experience IDs to fetch images
    const workExperienceIds = results.map(we => we.Id);
    
    // Fetch primary images for all work experiences in one query
    const imageQuery = `
      SELECT * 
      FROM work_experience_images 
      WHERE Work_Experience_Id IN (?) AND Is_Primary = 1
      UNION
      SELECT * 
      FROM work_experience_images 
      WHERE Work_Experience_Id IN (?) AND Work_Experience_Id NOT IN (
        SELECT DISTINCT Work_Experience_Id 
        FROM work_experience_images 
        WHERE Work_Experience_Id IN (?) AND Is_Primary = 1
      )
      GROUP BY Work_Experience_Id
      LIMIT 100
    `;
    
    try {
      const [images] = await database_pool.query(imageQuery, [workExperienceIds, workExperienceIds, workExperienceIds]);
      
      // Map images to their work experiences
      const resultsWithImages = results.map(we => {
        const primaryImage = images.find(img => img.Work_Experience_Id === we.Id);
        return {
          ...we,
          primaryImage: primaryImage ? getWorkExperienceImageUrl(primaryImage.Image_Url) : null
        };
      });
      
      res.status(200).json(resultsWithImages);
    } catch (imgErr) {
      console.error('Error fetching work experience images:', imgErr);
      // Still return the work experience data even if images fail
      return res.status(200).json(results);
    }
  } catch (err) {
    console.error('Error fetching work experience:', err);
    return res.status(500).json({ error: 'Failed to fetch work experience' });
  }
};

/**
 * Get a single work experience entry with all its images
 */
export const getSingleWorkExperience = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Work experience ID is required' });
  }
  
  const query = 'SELECT * FROM work_experience WHERE Id = ?';
  
  try {
    const [results] = await database_pool.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Work experience not found' });
    }
    
    const workExperience = results[0];
    
    // Fetch images for this work experience
    const imageQuery = 'SELECT * FROM work_experience_images WHERE Work_Experience_Id = ?';
    
    try {
      const [images] = await database_pool.query(imageQuery, [id]);
      
      // Process image URLs
      const processedImages = images.map(img => ({
        ...img,
        imageUrl: getWorkExperienceImageUrl(img.Image_Url)
      }));
      
      res.status(200).json({
        ...workExperience,
        images: processedImages
      });
    } catch (imgErr) {
      console.error('Error fetching work experience images:', imgErr);
      // Return work experience without images
      return res.status(200).json(workExperience);
    }
  } catch (err) {
    console.error('Error fetching work experience:', err);
    return res.status(500).json({ error: 'Failed to fetch work experience' });
  }
};

/**
 * Create a new work experience entry
 */
export const createWorkExperience = async (req, res) => {
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
    return res.status(400).json({ error: 'Freelancer ID and Project Title are required' });
  }
  
  try {
    // Check if freelancer exists
    const [results] = await database_pool.query('SELECT Id FROM freelancers WHERE Id = ?', [freelancerId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }
    
    // Insert work experience
    const workExperience = {
      Freelancer_Id: freelancerId,
      Project_Title: projectTitle,
      Description: description || null,
      Client_Name: clientName || null,
      Completion_Date: completionDate || null,
      Skills_Used: skillsUsed || null,
      Created_At: new Date()
    };
    
    const [insertResult] = await database_pool.query('INSERT INTO work_experience SET ?', [workExperience]);
    
    if (!insertResult.insertId) {
      return res.status(500).json({ error: 'Failed to create work experience' });
    }
    
    res.status(201).json({ 
      id: insertResult.insertId,
      message: 'Work experience created successfully' 
    });
  } catch (err) {
    console.error('Error creating work experience:', err);
    return res.status(500).json({ error: 'Failed to create work experience' });
  }
};

/**
 * Update an existing work experience entry
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
  
  if (!id) {
    return res.status(400).json({ error: 'Work experience ID is required' });
  }
  
  try {
    // Check if work experience exists and belongs to the freelancer
    const [results] = await database_pool.query('SELECT * FROM work_experience WHERE Id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Work experience not found' });
    }
    
    // Update work experience
    const updateData = {
      Project_Title: projectTitle || results[0].Project_Title,
      Description: description !== undefined ? description : results[0].Description,
      Client_Name: clientName !== undefined ? clientName : results[0].Client_Name,
      Completion_Date: completionDate !== undefined ? completionDate : results[0].Completion_Date,
      Skills_Used: skillsUsed !== undefined ? skillsUsed : results[0].Skills_Used,
      Updated_At: new Date()
    };
    
    const [updateResult] = await database_pool.query('UPDATE work_experience SET ? WHERE Id = ?', [updateData, id]);
    
    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to update work experience' });
    }
    
    res.status(200).json({ 
      message: 'Work experience updated successfully' 
    });
  } catch (err) {
    console.error('Error updating work experience:', err);
    return res.status(500).json({ error: 'Failed to update work experience' });
  }
};

/**
 * Delete a work experience entry and its associated images
 */
export const deleteWorkExperience = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Work experience ID is required' });
  }
  
  try {
    // Get image paths to delete files
    const [images] = await database_pool.query('SELECT Image_Url FROM work_experience_images WHERE Work_Experience_Id = ?', [id]);
    
    // Delete images from database
    await database_pool.query('DELETE FROM work_experience_images WHERE Work_Experience_Id = ?', [id]);
    
    // Delete work experience
    const [deleteResult] = await database_pool.query('DELETE FROM work_experience WHERE Id = ?', [id]);
    
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Work experience not found or already deleted' });
    }
    
    // Delete image files from storage
    images.forEach(img => {
      const imagePath = path.join(__dirname, '..', 'uploads', 'work_experience', img.Image_Url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
    
    res.status(200).json({ message: 'Work experience deleted successfully' });
  } catch (err) {
    console.error('Error deleting work experience:', err);
    return res.status(500).json({ error: 'Failed to delete work experience' });
  }
};

/**
 * Get work experience for profile display (public view)
 * Limited to 3 most recent entries
 */
export const getProfileWorkExperience = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Freelancer ID is required' });
  }
  
  const query = `
    SELECT we.*, 
           (SELECT COUNT(*) FROM work_experience_images WHERE Work_Experience_Id = we.Id) AS imageCount
    FROM work_experience we
    WHERE we.Freelancer_Id = ?
    ORDER BY we.Completion_Date DESC, we.Created_At DESC
    LIMIT 3
  `;
  
  try {
    const [results] = await database_pool.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get all work experience IDs to fetch images
    const workExperienceIds = results.map(we => we.Id);
    
    // Find primary images for these work experiences
    const imageQuery = `
      SELECT * 
      FROM work_experience_images 
      WHERE Work_Experience_Id IN (?) AND Is_Primary = 1
      UNION
      SELECT * 
      FROM work_experience_images 
      WHERE Work_Experience_Id IN (?) AND Work_Experience_Id NOT IN (
        SELECT DISTINCT Work_Experience_Id 
        FROM work_experience_images 
        WHERE Work_Experience_Id IN (?) AND Is_Primary = 1
      )
      GROUP BY Work_Experience_Id
      LIMIT 3
    `;
    
    try {
      const [images] = await database_pool.query(imageQuery, [workExperienceIds, workExperienceIds, workExperienceIds]);
      
      // Map images to their work experiences
      const resultsWithImages = results.map(we => {
        const primaryImage = images.find(img => img.Work_Experience_Id === we.Id);
        return {
          ...we,
          primaryImage: primaryImage ? getWorkExperienceImageUrl(primaryImage.Image_Url) : null
        };
      });
      
      res.status(200).json(resultsWithImages);
    } catch (imgErr) {
      console.error('Error fetching work experience images:', imgErr);
      // Still return the work experience data even if images fail
      return res.status(200).json(results);
    }
  } catch (err) {
    console.error('Error fetching profile work experience:', err);
    return res.status(500).json({ error: 'Failed to fetch work experience' });
  }
};

/**
 * Set an image as the primary image for a work experience
 */
export const setPrimaryImage = async (req, res) => {
  const { workExperienceId, imageId } = req.body;
  
  if (!workExperienceId || !imageId) {
    return res.status(400).json({ error: 'Work experience ID and image ID are required' });
  }
  
  try {
    // Check if image exists and belongs to the work experience
    const [images] = await database_pool.query(
      'SELECT * FROM work_experience_images WHERE Id = ? AND Work_Experience_Id = ?', 
      [imageId, workExperienceId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found or does not belong to this work experience' });
    }
    
    // Reset all images for this work experience to not be primary
    await database_pool.query(
      'UPDATE work_experience_images SET Is_Primary = 0 WHERE Work_Experience_Id = ?',
      [workExperienceId]
    );
    
    // Set the selected image as primary
    const [updateResult] = await database_pool.query(
      'UPDATE work_experience_images SET Is_Primary = 1 WHERE Id = ?',
      [imageId]
    );
    
    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to set primary image' });
    }
    
    res.status(200).json({ message: 'Primary image set successfully' });
  } catch (err) {
    console.error('Error setting primary image:', err);
    return res.status(500).json({ error: 'Failed to set primary image' });
  }
};

/**
 * Delete an image from a work experience
 */
export const deleteImage = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Image ID is required' });
  }
  
  try {
    // Get image info to delete file
    const [images] = await database_pool.query('SELECT * FROM work_experience_images WHERE Id = ?', [id]);
    
    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const image = images[0];
    const workExperienceId = image.Work_Experience_Id;
    const isPrimary = image.Is_Primary;
    
    // Delete image from database
    const [deleteResult] = await database_pool.query('DELETE FROM work_experience_images WHERE Id = ?', [id]);
    
    if (deleteResult.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to delete image' });
    }
    
    // Delete image file from storage
    const imagePath = path.join(__dirname, '..', 'uploads', 'work_experience', image.Image_Url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // If this was the primary image, set a new primary image if available
    if (isPrimary) {
      const [remainingImages] = await database_pool.query(
        'SELECT * FROM work_experience_images WHERE Work_Experience_Id = ? LIMIT 1',
        [workExperienceId]
      );
      
      if (remainingImages.length > 0) {
        await database_pool.query(
          'UPDATE work_experience_images SET Is_Primary = 1 WHERE Id = ?',
          [remainingImages[0].Id]
        );
      }
    }
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
};
