'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { localEventService } from '../../services/localEventService';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    requirements: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await localEventService.getAllEvents();
      setEvents(data);
      setError('');
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await localEventService.addEvent(formData);
      setOpenDialog(false);
      setSuccess('Event added successfully!');
      loadEvents();
      setFormData({
        companyName: '',
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        requirements: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to add event');
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Company Events</Typography>
        <Button 
          variant="contained" 
          onClick={() => setOpenDialog(true)}
        >
          Add Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent>
              <Typography variant="h6">{event.title}</Typography>
              <Typography color="textSecondary" gutterBottom>
                {event.companyName}
              </Typography>
              <Typography variant="body2" paragraph>
                {event.description}
              </Typography>
              <Typography variant="body2">
                Date: {event.date}
              </Typography>
              <Typography variant="body2">
                Time: {event.time}
              </Typography>
              <Typography variant="body2">
                Location: {event.location}
              </Typography>
              <Typography variant="body2">
                Requirements: {event.requirements}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
