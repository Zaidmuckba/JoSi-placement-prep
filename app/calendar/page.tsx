'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { calendarService } from '../services/calendarService';
import { PlacementEvent } from '../types/calendar';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
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

export default function Calendar() {
  const [events, setEvents] = useState<PlacementEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PlacementEvent | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const upcomingEvents = await calendarService.getUpcomingEvents();
      setEvents(upcomingEvents);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const isEligible = (event: PlacementEvent): boolean => {
    if (!user || !event.eligibilityCriteria) return false;

    const { courses, cgpa } = event.eligibilityCriteria;
    const userCourse = user.course;
    const userCgpa = user.cgpa || 0;

    return (
      courses.includes(userCourse) &&
      (!cgpa || userCgpa >= cgpa)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <Typography variant="h4" className="mb-6">
        Placement Calendar
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card 
            key={event.id}
            className={`relative ${!isEligible(event) ? 'opacity-50' : ''}`}
            onClick={() => {
              setSelectedEvent(event);
              setOpenDialog(true);
            }}
            sx={{ cursor: 'pointer' }}
          >
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
                {!isEligible(event) && (
                  <Chip
                    label="Not Eligible"
                    size="small"
                    color="error"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatDate(event.startDate)}
              </Typography>
              {event.roles && event.roles.length > 0 && (
                <Box className="mt-2">
                  <Typography variant="subtitle2">Available Roles:</Typography>
                  <div className="flex flex-wrap gap-1">
                    {event.roles.map((role, index) => (
                      <Chip
                        key={index}
                        label={`${role.title} (₹${role.package.base})`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </div>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>
              {selectedEvent.title}
            </DialogTitle>
            <DialogContent>
              <Box className="flex flex-col gap-4">
                <Typography variant="h6" color="primary">
                  {selectedEvent.companyName}
                </Typography>

                <Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    Event Type
                  </Typography>
                  <Chip
                    label={selectedEvent.eventType.replace('_', ' ')}
                    color="primary"
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>
                    {selectedEvent.description}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography>
                    Start: {formatDate(selectedEvent.startDate)}
                  </Typography>
                  <Typography>
                    End: {formatDate(selectedEvent.endDate)}
                  </Typography>
                </Box>

                {selectedEvent.location && (
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Location
                    </Typography>
                    <Typography>
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                )}

                {selectedEvent.roles && selectedEvent.roles.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Available Roles
                    </Typography>
                    <List>
                      {selectedEvent.roles.map((role, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={role.title}
                            secondary={`Base Package: ₹${role.package.base}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {selectedEvent.requiredDocuments && selectedEvent.requiredDocuments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Required Documents
                    </Typography>
                    <List>
                      {selectedEvent.requiredDocuments.map((doc, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={doc} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {selectedEvent.eligibilityCriteria && (
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Eligibility Criteria
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Eligible Courses"
                          secondary={selectedEvent.eligibilityCriteria.courses.join(', ')}
                        />
                      </ListItem>
                      {selectedEvent.eligibilityCriteria.cgpa && (
                        <ListItem>
                          <ListItemText
                            primary="Minimum CGPA"
                            secondary={selectedEvent.eligibilityCriteria.cgpa}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </motion.div>
  );
}