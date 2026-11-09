'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { calendarService } from '../../services/calendarService';
import { PlacementEvent } from '../../types/calendar';
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

export default function StudentCalendar() {
  const [events, setEvents] = useState<PlacementEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useUser();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const upcomingEvents = await calendarService.getUpcomingEvents();
      const eligibleEvents = upcomingEvents.filter(event => {
        const { eligibilityCriteria } = event;
        if (!eligibilityCriteria) return true;
        
        const isEligibleCourse = !eligibilityCriteria.courses.length || 
          eligibilityCriteria.courses.includes(userProfile?.course || '');
        
        const isEligibleCGPA = !eligibilityCriteria.cgpa || 
          (userProfile?.cgpa && userProfile.cgpa >= eligibilityCriteria.cgpa);
        
        return isEligibleCourse && isEligibleCGPA;
      });

      setEvents(eligibleEvents);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events');
    }
  };

  if (!userProfile) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Please complete your profile to view placement events.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Upcoming Placement Events
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {events.length === 0 ? (
        <Alert severity="info">
          No upcoming events available at this time.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Event</strong></TableCell>
                <TableCell><strong>Date & Time</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Required Documents</strong></TableCell>
                <TableCell><strong>Eligibility Criteria</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.companyName}</TableCell>
                  <TableCell>
                    {event.title}
                    <Typography variant="caption" display="block" color="textSecondary">
                      {event.eventType.replace(/_/g, ' ')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Start: {formatDate(event.startDate)}
                    </Typography>
                    <Typography variant="body2">
                      End: {formatDate(event.endDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>{event.location || 'TBA'}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>
                    {event.requiredDocuments?.length ? (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {event.requiredDocuments.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    ) : (
                      'No documents required'
                    )}
                  </TableCell>
                  <TableCell>
                    {event.eligibilityCriteria ? (
                      <>
                        {event.eligibilityCriteria.courses?.length > 0 && (
                          <Typography variant="body2">
                            <strong>Courses:</strong> {event.eligibilityCriteria.courses.join(', ')}
                          </Typography>
                        )}
                        {event.eligibilityCriteria.cgpa > 0 && (
                          <Typography variant="body2">
                            <strong>Min CGPA:</strong> {event.eligibilityCriteria.cgpa}
                          </Typography>
                        )}
                        {event.eligibilityCriteria.otherRequirements?.length > 0 && (
                          <Typography variant="body2">
                            <strong>Other Requirements:</strong>
                            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                              {event.eligibilityCriteria.otherRequirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </Typography>
                        )}
                      </>
                    ) : (
                      'No specific criteria'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
