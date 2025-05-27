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

const BASE_URL = 'https://freelancing-web-application-production.up.railway.app';

const WorkExperience = ({ freelancerId, isOwner }) => {
  const [experiences, setExperiences] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    clientName: '',
    completionDate: '',
    skillsUsed: '',
    images: []
  });

  const fetchExperiences = async () => {
    if (!freelancerId) {
      setLoading(false);
      setExperiences([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/work-experience/${freelancerId}`, {
        withCredentials: true
      });
      
      // Handle both array and single object responses
      if (Array.isArray(response.data)) {
        setExperiences(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If it's a single object, wrap it in an array
        setExperiences([response.data]);
      } else {
        // If no data or invalid data, set empty array
        setExperiences([]);
      }
    } catch (error) {
      console.error('Failed to fetch work experience:', error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 404) {
          setError('No work experience found for this freelancer.');
        } else {
          setError(error.response.data?.message || 'Failed to fetch work experience');
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
      
      setExperiences([]); // Set empty array on error
    } finally {
      setLoading(false);
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
      await axios.post(`${BASE_URL}/work-experience`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
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
      await axios.delete(`${BASE_URL}/work-experience/${id}`, {
        withCredentials: true
      });
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

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography>Loading work experience...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

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
        {experiences && experiences.length > 0 ? (
          experiences.map((exp) => (
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
                        src={`${BASE_URL}${exp.images.split(',')[0]}`}
                        alt="Project"
                        style={{ width: '100%', height: 200, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary" align="center">
              No work experience added yet.
            </Typography>
          </Grid>
        )}
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
              style={{ marginTop: '16px' }}
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