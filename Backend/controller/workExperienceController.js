// workExperienceController.js
import { connection } from '../sqlconnection.js';
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
export const getWorkExperience = (req, res) => {
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
  
  connection.query(query, [freelancerId], (err, results) => {
    if (err) {
      console.error('Error fetching work experience:', err);
      return res.status(500).json({ error: 'Failed to fetch work experience' });
    }
    
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
    
    connection.query(imageQuery, [workExperienceIds, workExperienceIds, workExperienceIds], (imgErr, images) => {
      if (imgErr) {
        console.error('Error fetching work experience images:', imgErr);
        // Still return the work experience data even if images fail
        return res.status(200).json(results);
      }
      
      // Map images to their work experiences
      const resultsWithImages = results.map(we => {
        const primaryImage = images.find(img => img.Work_Experience_Id === we.Id);
        return {
          ...we,
          primaryImage: primaryImage ? getWorkExperienceImageUrl(primaryImage.Image_Url) : null
        };
      });
      
      res.status(200).json(resultsWithImages);
    });
  });
};

/**
 * Get a single work experience entry with all its images
 */
export const getSingleWorkExperience = (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Work experience ID is required' });
  }
  
  const query = 'SELECT * FROM work_experience WHERE Id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching work experience:', err);
      return res.status(500).json({ error: 'Failed to fetch work experience' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Work experience not found' });
    }
    
    const workExperience = results[0];
    
    // Fetch images for this work experience
    const imageQuery = 'SELECT * FROM work_experience_images WHERE Work_Experience_Id = ?';
    
    connection.query(imageQuery, [id], (imgErr, images) => {
      if (imgErr) {
        console.error('Error fetching work experience images:', imgErr);
        // Return work experience without images
        return res.status(200).json(workExperience);
      }
      
      // Process image URLs
      const processedImages = images.map(img => ({
        ...img,
        imageUrl: getWorkExperienceImageUrl(img.Image_Url)
      }));
      
      res.status(200).json({
        ...workExperience,
        images: processedImages
      });
    });
  });
};

/**
 * Create a new work experience entry
 */
export const createWorkExperience = (req, res) => {
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
  
  // Check if freelancer exists
  connection.query('SELECT Id FROM freelancers WHERE Id = ?', [freelancerId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error checking freelancer:', err);
      return res.status(404).json({ error: 'Freelancer not found' });
    }
    
    // Check if freelancer already has 3 work experience entries
    connection.query(
      'SELECT COUNT(*) as count FROM work_experience WHERE Freelancer_Id = ?', 
      [freelancerId], 
      (countErr, countResults) => {
        if (countErr) {
          console.error('Error counting work experience:', countErr);
          return res.status(500).json({ error: 'Failed to check existing work experience count' });
        }
        
        const count = countResults[0].count;
        if (count >= 3) {
          return res.status(400).json({ 
            error: 'Freelancer already has 3 work experience entries. Please delete one before adding a new one.'
          });
        }
        
        // Insert new work experience
        const workExp = {
          Freelancer_Id: freelancerId,
          Project_Title: projectTitle,
          Description: description || null,
          Client_Name: clientName || null,
          Completion_Date: completionDate || null,
          Skills_Used: skillsUsed || null
        };
        
        connection.query('INSERT INTO work_experience SET ?', workExp, (insertErr, result) => {
          if (insertErr) {
            console.error('Error creating work experience:', insertErr);
            return res.status(500).json({ error: 'Failed to create work experience' });
          }
          
          const workExperienceId = result.insertId;
          
          // Handle file uploads if any
          if (req.files && req.files.length > 0) {
            const imageValues = req.files.map((file, index) => [
              workExperienceId,
              file.filename,
              index === 0 ? 1 : 0 // Make first image primary by default
            ]);
            
            const insertImageQuery = 'INSERT INTO work_experience_images (Work_Experience_Id, Image_Url, Is_Primary) VALUES ?';
            
            connection.query(insertImageQuery, [imageValues], (imgErr) => {
              if (imgErr) {
                console.error('Error saving work experience images:', imgErr);
                // Return success even if image saving fails, since work experience was created
                return res.status(201).json({ 
                  id: workExperienceId,
                  message: 'Work experience created but there was an issue saving the images'
                });
              }
              
              res.status(201).json({ 
                id: workExperienceId, 
                message: 'Work experience created successfully' 
              });
            });
          } else {
            // No images to save
            res.status(201).json({ 
              id: workExperienceId, 
              message: 'Work experience created successfully' 
            });
          }
        });
      }
    );
  });
};

/**
 * Update an existing work experience entry
 */
export const updateWorkExperience = (req, res) => {
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
  
  // First check if the work experience exists
  connection.query('SELECT * FROM work_experience WHERE Id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error checking work experience:', err);
      return res.status(500).json({ error: 'Failed to check work experience' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Work experience not found' });
    }
    
    // Update work experience
    const updateData = {
      Project_Title: projectTitle || results[0].Project_Title,
      Description: description !== undefined ? description : results[0].Description,
      Client_Name: clientName !== undefined ? clientName : results[0].Client_Name,
      Completion_Date: completionDate || results[0].Completion_Date,
      Skills_Used: skillsUsed !== undefined ? skillsUsed : results[0].Skills_Used,
      Updated_At: new Date()
    };
    
    connection.query('UPDATE work_experience SET ? WHERE Id = ?', [updateData, id], (updateErr) => {
      if (updateErr) {
        console.error('Error updating work experience:', updateErr);
        return res.status(500).json({ error: 'Failed to update work experience' });
      }
      
      // Handle file uploads if any
      if (req.files && req.files.length > 0) {
        const imageValues = req.files.map((file) => [
          id,
          file.filename,
          0 // Not primary by default
        ]);
        
        const insertImageQuery = 'INSERT INTO work_experience_images (Work_Experience_Id, Image_Url, Is_Primary) VALUES ?';
        
        connection.query(insertImageQuery, [imageValues], (imgErr) => {
          if (imgErr) {
            console.error('Error saving work experience images:', imgErr);
            return res.status(200).json({ 
              id: parseInt(id), 
              message: 'Work experience updated but there was an issue saving the new images'
            });
          }
          
          res.status(200).json({ 
            id: parseInt(id), 
            message: 'Work experience updated successfully with new images' 
          });
        });
      } else {
        // No new images
        res.status(200).json({ 
          id: parseInt(id), 
          message: 'Work experience updated successfully' 
        });
      }
    });
  });
};

/**
 * Delete a work experience entry and its associated images
 */
export const deleteWorkExperience = (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Work experience ID is required' });
  }
  
  // First get all image filenames to delete from disk
  connection.query('SELECT Image_Url FROM work_experience_images WHERE Work_Experience_Id = ?', [id], (err, images) => {
    // Continue with deletion even if there's an error fetching images
    
    // Delete from database - the foreign key constraint will automatically delete related images
    connection.query('DELETE FROM work_experience WHERE Id = ?', [id], (deleteErr, result) => {
      if (deleteErr) {
        console.error('Error deleting work experience:', deleteErr);
        return res.status(500).json({ error: 'Failed to delete work experience' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Work experience not found' });
      }
      
      // Try to delete image files from disk if any
      if (!err && images.length > 0) {
        const workExperienceDir = path.join(__dirname, '..', 'assets', 'workExperienceImages');
        
        images.forEach(image => {
          try {
            const filePath = path.join(workExperienceDir, image.Image_Url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (fileErr) {
            console.error('Error deleting image file:', fileErr);
            // Continue regardless of file deletion errors
          }
        });
      }
      
      res.status(200).json({ message: 'Work experience deleted successfully' });
    });
  });
};

/**
 * Get work experience for profile display (public view)
 * Limited to 3 most recent entries
 */
export const getProfileWorkExperience = (req, res) => {
  const { freelancerId } = req.params;
  
  if (!freelancerId) {
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
  
  connection.query(query, [freelancerId], (err, results) => {
    if (err) {
      console.error('Error fetching profile work experience:', err);
      return res.status(500).json({ error: 'Failed to fetch work experience' });
    }
    
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
    
    connection.query(imageQuery, [workExperienceIds, workExperienceIds, workExperienceIds], (imgErr, images) => {
      if (imgErr) {
        console.error('Error fetching work experience images:', imgErr);
        // Still return the work experience data even if images fail
        return res.status(200).json(results);
      }
      
      // Map images to their work experiences
      const resultsWithImages = results.map(we => {
        const primaryImage = images.find(img => img.Work_Experience_Id === we.Id);
        return {
          ...we,
          primaryImage: primaryImage ? getWorkExperienceImageUrl(primaryImage.Image_Url) : null
        };
      });
      
      res.status(200).json(resultsWithImages);
    });
  });
};

/**
 * Set an image as the primary image for a work experience
 */
export const setPrimaryImage = (req, res) => {
  const { imageId } = req.params;
  
  if (!imageId) {
    return res.status(400).json({ error: 'Image ID is required' });
  }
  
  // First get the work experience ID for this image
  connection.query('SELECT Work_Experience_Id FROM work_experience_images WHERE Id = ?', [imageId], (err, results) => {
    if (err) {
      console.error('Error fetching image info:', err);
      return res.status(500).json({ error: 'Failed to set primary image' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const workExperienceId = results[0].Work_Experience_Id;
    
    // First reset all images for this work experience to not primary
    connection.query(
      'UPDATE work_experience_images SET Is_Primary = 0 WHERE Work_Experience_Id = ?', 
      [workExperienceId], 
      (resetErr) => {
        if (resetErr) {
          console.error('Error resetting primary images:', resetErr);
          return res.status(500).json({ error: 'Failed to set primary image' });
        }
        
        // Set the selected image as primary
        connection.query(
          'UPDATE work_experience_images SET Is_Primary = 1 WHERE Id = ?', 
          [imageId], 
          (updateErr) => {
            if (updateErr) {
              console.error('Error setting primary image:', updateErr);
              return res.status(500).json({ error: 'Failed to set primary image' });
            }
            
            res.status(200).json({ message: 'Primary image set successfully' });
          }
        );
      }
    );
  });
};

/**
 * Delete an image from a work experience
 */
export const deleteImage = (req, res) => {
  const { imageId } = req.params;
  
  if (!imageId) {
    return res.status(400).json({ error: 'Image ID is required' });
  }
  
  // First get the image details
  connection.query('SELECT * FROM work_experience_images WHERE Id = ?', [imageId], (err, results) => {
    if (err) {
      console.error('Error fetching image info:', err);
      return res.status(500).json({ error: 'Failed to delete image' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const image = results[0];
    const workExperienceId = image.Work_Experience_Id;
    const isPrimary = image.Is_Primary;
    
    // Delete the image from the database
    connection.query('DELETE FROM work_experience_images WHERE Id = ?', [imageId], (deleteErr) => {
      if (deleteErr) {
        console.error('Error deleting image from database:', deleteErr);
        return res.status(500).json({ error: 'Failed to delete image' });
      }
      
      // Try to delete the file from disk
      try {
        const filePath = path.join(__dirname, '..', 'assets', 'workExperienceImages', image.Image_Url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileErr) {
        console.error('Error deleting image file:', fileErr);
        // Continue regardless of file deletion errors
      }
      
      // If this was a primary image, set another image as primary
      if (isPrimary) {
        connection.query(
          'SELECT Id FROM work_experience_images WHERE Work_Experience_Id = ? LIMIT 1', 
          [workExperienceId], 
          (selectErr, imageResults) => {
            if (!selectErr && imageResults.length > 0) {
              connection.query(
                'UPDATE work_experience_images SET Is_Primary = 1 WHERE Id = ?', 
                [imageResults[0].Id], 
                (updateErr) => {
                  if (updateErr) {
                    console.error('Error setting new primary image:', updateErr);
                  }
                }
              );
            }
          }
        );
      }
      
      res.status(200).json({ message: 'Image deleted successfully' });
    });
  });
};
