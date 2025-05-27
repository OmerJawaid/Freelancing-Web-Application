import express from 'express';
import multer from 'multer';
import path from 'path';
import { database_pool as db } from '../config/dbconnection.js';

import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/work-experience')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Get work experience for a freelancer
router.get('/:freelancerId', async (req, res) => {
  try {
    const [workExperience] = await db.query(
      `SELECT we.*, GROUP_CONCAT(wei.Image_Url) as images 
       FROM work_experience we 
       LEFT JOIN work_experience_images wei ON we.Id = wei.Work_Experience_Id 
       WHERE we.Freelancer_Id = ? 
       GROUP BY we.Id 
       ORDER BY we.Completion_Date DESC 
       LIMIT 3`,
      [req.params.freelancerId]
    );

    res.json(workExperience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new work experience
router.post('/', verifyToken, upload.array('images', 5), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check if user already has 3 projects
    const [existingProjects] = await conn.query(
      'SELECT COUNT(*) as count FROM work_experience WHERE Freelancer_Id = ?',
      [req.user.id]
    );

    if (existingProjects[0].count >= 3) {
      throw new Error('Maximum limit of 3 projects reached');
    }

    // Insert work experience
    const [result] = await conn.query(
      'INSERT INTO work_experience (Freelancer_Id, Project_Title, Description, Client_Name, Completion_Date, Skills_Used) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, req.body.projectTitle, req.body.description, req.body.clientName, req.body.completionDate, req.body.skillsUsed]
    );

    // Insert images
    if (req.files && req.files.length > 0) {
      const imageValues = req.files.map((file, index) => [
        result.insertId,
        `/uploads/work-experience/${file.filename}`,
        index === 0 // First image is primary
      ]);

      await conn.query(
        'INSERT INTO work_experience_images (Work_Experience_Id, Image_Url, Is_Primary) VALUES ?',
        [imageValues]
      );
    }

    await conn.commit();
    res.json({ message: 'Work experience added successfully' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// Delete work experience
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM work_experience WHERE Id = ? AND Freelancer_Id = ?', 
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Work experience deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 