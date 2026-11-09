'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { Timestamp } from 'firebase/firestore';
import { calendarService } from '../../services/calendarService';
import { 
  PlacementEvent, 
  PlacementRole, 
  ShortlistedCandidate,
  PlacementEventType,
  PlacementEventStatus,
  CandidateRound,
  CandidateStatus 
} from '../../types/calendar';
import { useUser } from '../../contexts/UserContext';

const formatDate = (date: string | Timestamp) => {
  const d = date instanceof Timestamp ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateForInput = (date: Date | null) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

interface FormData {
  companyName: string;
  eventType: PlacementEventType;
  title: string;
  description: string;
  startDate: Date | null;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  location: string;
  requiredDocuments: string;
  courses: string;
  cgpa: string;
  roles: PlacementRole[];
  shortlistedCandidates: ShortlistedCandidate[];
  selectedCandidates: string[];
}

export default function AdminCalendar() {
  const [events, setEvents] = useState<PlacementEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PlacementEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, userProfile } = useUser();

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    eventType: 'ORIENTATION',
    title: '',
    description: '',
    startDate: null,
    startTime: '',
    endDate: null,
    endTime: '',
    location: '',
    requiredDocuments: '',
    courses: '',
    cgpa: '',
    roles: [],
    shortlistedCandidates: [],
    selectedCandidates: [],
  });

  useEffect(() => {
    if (!userProfile?.isAdmin) {
      setError('Admin access required');
      return;
    }
    loadEvents();
  }, [userProfile]);

  const loadEvents = async () => {
    try {
      const upcomingEvents = await calendarService.getUpcomingEvents();
      setEvents(upcomingEvents);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!userProfile?.isAdmin) {
        throw new Error('Admin access required');
      }

      if (!formData.companyName || !formData.title || !formData.startDate || !formData.endDate) {
        setError('Please fill in all required fields');
        return;
      }

      const startDateTime = new Date(formData.startDate);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours || 0, startMinutes || 0);

      const endDateTime = new Date(formData.endDate);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours || 0, endMinutes || 0);

      const eventData = {
        companyName: formData.companyName,
        eventType: formData.eventType,
        title: formData.title,
        description: formData.description,
        startDate: Timestamp.fromDate(startDateTime),
        endDate: Timestamp.fromDate(endDateTime),
        location: formData.location,
        requiredDocuments: formData.requiredDocuments.split(',').map(doc => doc.trim()).filter(Boolean),
        eligibilityCriteria: {
          courses: formData.courses.split(',').map(course => course.trim()).filter(Boolean),
          cgpa: parseFloat(formData.cgpa) || 0
        },
        status: 'UPCOMING' as const,
        roles: formData.roles,
        shortlistedCandidates: formData.shortlistedCandidates,
        selectedCandidates: formData.selectedCandidates,
      };

      if (selectedEvent) {
        await calendarService.updatePlacementEvent(selectedEvent.id, eventData);
        setSuccess('Event updated successfully');
      } else {
        await calendarService.createPlacementEvent(eventData);
        setSuccess('Event created successfully');
      }

      setOpenDialog(false);
      await loadEvents();
      
      // Reset form
      setFormData({
        companyName: '',
        eventType: 'ORIENTATION',
        title: '',
        description: '',
        startDate: null,
        startTime: '',
        endDate: null,
        endTime: '',
        location: '',
        requiredDocuments: '',
        courses: '',
        cgpa: '',
        roles: [],
        shortlistedCandidates: [],
        selectedCandidates: [],
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Failed to save event');
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Calendar Events</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedEvent(null);
            setOpenDialog(true);
          }}
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

      <List>
        {events.map((event) => (
          <Card key={event.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {event.companyName}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {event.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Start:</strong> {formatDate(event.startDate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>End:</strong> {formatDate(event.endDate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {event.location}
                  </Typography>
                  {event.eligibilityCriteria && (
                    <>
                      <Typography variant="body2">
                        <strong>Required CGPA:</strong> {event.eligibilityCriteria.cgpa}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Eligible Courses:</strong>{' '}
                        {event.eligibilityCriteria.courses.join(', ')}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box>
                  <IconButton
                    onClick={() => {
                      setSelectedEvent(event);
                      setFormData({
                        companyName: event.companyName,
                        eventType: event.eventType,
                        title: event.title,
                        description: event.description,
                        startDate: event.startDate instanceof Timestamp ? event.startDate.toDate() : new Date(event.startDate),
                        startTime: event.startDate instanceof Timestamp ? 
                          `${event.startDate.toDate().getHours().toString().padStart(2, '0')}:${event.startDate.toDate().getMinutes().toString().padStart(2, '0')}` : 
                          '00:00',
                        endDate: event.endDate instanceof Timestamp ? event.endDate.toDate() : new Date(event.endDate),
                        endTime: event.endDate instanceof Timestamp ? 
                          `${event.endDate.toDate().getHours().toString().padStart(2, '0')}:${event.endDate.toDate().getMinutes().toString().padStart(2, '0')}` : 
                          '00:00',
                        location: event.location,
                        requiredDocuments: event.requiredDocuments.join(', '),
                        courses: event.eligibilityCriteria.courses.join(', '),
                        cgpa: event.eligibilityCriteria.cgpa.toString(),
                        roles: event.roles || [],
                        shortlistedCandidates: event.shortlistedCandidates || [],
                        selectedCandidates: event.selectedCandidates || [],
                      });
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={async () => {
                      try {
                        await calendarService.deletePlacementEvent(event.id);
                        setSuccess('Event deleted successfully');
                        loadEvents();
                      } catch (err) {
                        console.error('Error deleting event:', err);
                        setError('Failed to delete event');
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Event Type</InputLabel>
              <Select
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                label="Event Type"
              >
                <MenuItem value="ORIENTATION">Orientation</MenuItem>
                <MenuItem value="TEST">Test</MenuItem>
                <MenuItem value="INTERVIEW">Interview</MenuItem>
              </Select>
            </FormControl>
            <Box display="flex" gap={2}>
              <TextField
                type="date"
                label="Start Date"
                value={formData.startDate ? formatDateForInput(formData.startDate) : ''}
                onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="time"
                label="Start Time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                type="date"
                label="End Date"
                value={formData.endDate ? formatDateForInput(formData.endDate) : ''}
                onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="time"
                label="End Time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Required Documents (comma-separated)"
              value={formData.requiredDocuments}
              onChange={(e) => handleInputChange('requiredDocuments', e.target.value)}
              margin="normal"
              helperText="Enter document names separated by commas"
            />
            <TextField
              fullWidth
              label="Eligible Courses (comma-separated)"
              value={formData.courses}
              onChange={(e) => handleInputChange('courses', e.target.value)}
              margin="normal"
              helperText="Enter course names separated by commas"
            />
            <TextField
              fullWidth
              label="Minimum CGPA"
              type="number"
              value={formData.cgpa}
              onChange={(e) => handleInputChange('cgpa', e.target.value)}
              margin="normal"
              inputProps={{ step: 0.01, min: 0, max: 10 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedEvent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
