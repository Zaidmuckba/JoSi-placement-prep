'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
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
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Timestamp } from 'firebase/firestore';

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

interface FormData {
  companyName: string;
  eventType: PlacementEventType;
  title: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  requiredDocuments: string;
  courses: string;
  cgpa: string;
  roles: PlacementRole[];
  shortlistedCandidates: ShortlistedCandidate[];
  selectedCandidates: string[];
}

export default function Calendar() {
  const [events, setEvents] = useState<PlacementEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PlacementEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useUser();

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    eventType: 'ORIENTATION',
    title: '',
    description: '',
    startDate: null,
    endDate: null,
    location: '',
    requiredDocuments: '',
    courses: '',
    cgpa: '',
    roles: [],
    shortlistedCandidates: [],
    selectedCandidates: [],
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const upcomingEvents = await calendarService.getUpcomingEvents();
      setEvents(upcomingEvents);
    } catch (err) {
      setError('Failed to load events');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const eventData: Omit<PlacementEvent, 'id'> = {
        companyName: formData.companyName,
        eventType: formData.eventType,
        title: formData.title,
        description: formData.description,
        startDate: Timestamp.fromDate(formData.startDate || new Date()),
        endDate: Timestamp.fromDate(formData.endDate || new Date()),
        location: formData.location,
        requiredDocuments: formData.requiredDocuments.split(',').map(doc => doc.trim()),
        eligibilityCriteria: {
          courses: formData.courses.split(',').map(course => course.trim()),
          cgpa: parseFloat(formData.cgpa) || undefined,
        },
        status: 'UPCOMING',
        roles: formData.roles,
        shortlistedCandidates: formData.shortlistedCandidates,
        selectedCandidates: formData.selectedCandidates,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (selectedEvent) {
        await calendarService.updatePlacementEvent(selectedEvent.id, eventData);
      } else {
        await calendarService.createPlacementEvent(eventData);
      }

      setSuccess('Event saved successfully!');
      setOpenDialog(false);
      loadEvents();
      resetForm();
    } catch (err) {
      setError('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      eventType: 'ORIENTATION',
      title: '',
      description: '',
      startDate: null,
      endDate: null,
      location: '',
      requiredDocuments: '',
      courses: '',
      cgpa: '',
      roles: [],
      shortlistedCandidates: [],
      selectedCandidates: [],
    });
    setSelectedEvent(null);
    setActiveTab(0);
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarService.deletePlacementEvent(eventId);
        loadEvents();
      } catch (err) {
        setError('Failed to delete event');
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Box className="flex justify-between items-center mb-6">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            Add Event
          </Button>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="relative">
              <CardContent>
                <Typography variant="h6">{event.title}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  {event.companyName}
                </Typography>
                <Box className="flex gap-2 mb-2">
                  <Chip
                    label={event.eventType.replace('_', ' ')}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={event.status}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2">
                  {formatDate(event.startDate)}
                </Typography>
                <Box className="absolute top-2 right-2 flex gap-1">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedEvent(event);
                      setFormData({
                        companyName: event.companyName,
                        eventType: event.eventType,
                        title: event.title,
                        description: event.description,
                        startDate: new Date(event.startDate instanceof Timestamp ? event.startDate.toDate() : event.startDate),
                        endDate: new Date(event.endDate instanceof Timestamp ? event.endDate.toDate() : event.endDate),
                        location: event.location || '',
                        requiredDocuments: event.requiredDocuments?.join(', ') || '',
                        courses: event.eligibilityCriteria?.courses.join(', ') || '',
                        cgpa: event.eligibilityCriteria?.cgpa?.toString() || '',
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
                    size="small"
                    onClick={() => handleDelete(event.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {selectedEvent ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                  <Tab label="Basic Info" />
                  <Tab label="Roles" />
                  <Tab label="Candidates" />
                </Tabs>
              </Box>

              {activeTab === 0 && (
                <Box className="flex flex-col gap-4">
                  <TextField
                    label="Company Name"
                    fullWidth
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />

                  <TextField
                    label="Event Title"
                    fullWidth
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />

                  <FormControl fullWidth>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value as PlacementEventType })}
                      required
                    >
                      <MenuItem value="ORIENTATION">Orientation</MenuItem>
                      <MenuItem value="WRITTEN_TEST">Written Test</MenuItem>
                      <MenuItem value="INTERVIEW">Interview</MenuItem>
                      <MenuItem value="RESULTS">Results</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />

                  <DateTimePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(date) => setFormData({ ...formData, startDate: date })}
                  />

                  <DateTimePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(date) => setFormData({ ...formData, endDate: date })}
                  />

                  <TextField
                    label="Location"
                    fullWidth
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />

                  <TextField
                    label="Required Documents (comma-separated)"
                    fullWidth
                    value={formData.requiredDocuments}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                  />

                  <TextField
                    label="Eligible Courses (comma-separated)"
                    fullWidth
                    value={formData.courses}
                    onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
                  />

                  <TextField
                    label="Minimum CGPA"
                    type="number"
                    fullWidth
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  />
                </Box>
              )}

              {activeTab === 1 && (
                <Box className="flex flex-col gap-4">
                  <Typography variant="h6">Roles</Typography>
                  <List>
                    {formData.roles.map((role, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={role.title}
                          secondary={`Package: ${role.package.base}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {activeTab === 2 && (
                <Box className="flex flex-col gap-4">
                  <Typography variant="h6">Shortlisted Candidates</Typography>
                  <List>
                    {formData.shortlistedCandidates.map((candidate, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={candidate.studentId}
                          secondary={`Round: ${candidate.round}, Status: ${candidate.status}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} disabled={isSubmitting}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (selectedEvent ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
            {success && (
              <Alert severity="success" className="mt-2" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}
          </form>
        </Dialog>
      </motion.div>
    </LocalizationProvider>
  );
}
