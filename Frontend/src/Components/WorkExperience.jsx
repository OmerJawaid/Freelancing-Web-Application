import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Grid,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const WorkExperience = ({ freelancerId, isOwner }) => {
  const [experiences, setExperiences] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    clientName: '',
    completionDate: '',
    skillsUsed: '',
    images: []
  });

  const fetchExperiences = async () => {
    try {
      const response = await axios.get(`/api/work-experience/${freelancerId}`);
      setExperiences(response.data);
    } catch (error) {
      toast.error('Failed to fetch work experience');
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [freelancerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'images') {
        formData.images.forEach(image => {
          formDataToSend.append('images', image);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      await axios.post('/api/work-experience', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Work experience added successfully');
      setOpen(false);
      fetchExperiences();
      setFormData({
        projectTitle: '',
        description: '',
        clientName: '',
        completionDate: '',
        skillsUsed: '',
        images: []
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add work experience');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/work-experience/${id}`);
      toast.success('Work experience deleted successfully');
      fetchExperiences();
    } catch (error) {
      toast.error('Failed to delete work experience');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(e.target.files)
      }));
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Work Experience</Typography>
        {isOwner && experiences.length < 3 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add Experience
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {experiences.map((exp) => (
          <Grid item xs={12} md={4} key={exp.Id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{exp.Project_Title}</Typography>
                  {isOwner && (
                    <IconButton onClick={() => handleDelete(exp.Id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(exp.Completion_Date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" paragraph>
                  {exp.Description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Client: {exp.Client_Name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Skills: {exp.Skills_Used}
                </Typography>
                {exp.images && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={exp.images.split(',')[0]}
                      alt="Project"
                      style={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Work Experience</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Project Title"
              value={formData.projectTitle}
              onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Client Name"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Completion Date"
              value={formData.completionDate}
              onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Skills Used"
              value={formData.skillsUsed}
              onChange={(e) => setFormData({ ...formData, skillsUsed: e.target.value })}
              margin="normal"
              required
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ marginTop: 16 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Experience
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default WorkExperience; 