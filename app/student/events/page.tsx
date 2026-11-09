'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { localEventService } from '../../services/localEventService';

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await localEventService.getAllEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading events...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Company Events
      </Typography>

      {events.length === 0 ? (
        <Alert severity="info">
          No events available at this time.
        </Alert>
      ) : (
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
                  <strong>Date:</strong> {event.date}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {event.time}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {event.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Requirements:</strong> {event.requirements}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
