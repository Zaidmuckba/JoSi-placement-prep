'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Stack,
  Card,
  CardContent,
  IconButton,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  WorkOutline as WorkIcon,
  LocalCafe as BreakIcon
} from '@mui/icons-material';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    // Initialize audio on client side only
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleCycleComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleCycleComplete = () => {
    try {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log('Audio play failed:', err);
        });
      }
    } catch (err) {
      console.log('Audio error:', err);
    }
    
    if (!isBreak) {
      setCycles(prev => prev + 1);
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(25 * 60);
    }
    setIsBreak(!isBreak);
    setIsRunning(false);
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (isBreak ? 5 * 60 : 25 * 60)) * 100;

  return (
    <Card sx={{ maxWidth: 400, m: 2 }}>
      <CardContent>
        <Stack spacing={2} alignItems="center">
          <Typography component="div" variant="h5" gutterBottom>
            Pomodoro Timer
          </Typography>
          
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={progress}
              size={120}
              color={isBreak ? "secondary" : "primary"}
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography component="div" variant="h4">
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton 
              onClick={() => setIsRunning(!isRunning)}
              color="primary"
            >
              {isRunning ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton 
              onClick={handleReset}
              color="error"
            >
              <StopIcon />
            </IconButton>
          </Stack>

          <Box>
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              {isBreak ? (
                <>
                  <BreakIcon color="secondary" />
                  <Typography component="div" variant="body2" color="text.secondary">
                    Break Time!
                  </Typography>
                </>
              ) : (
                <>
                  <WorkIcon color="primary" />
                  <Typography component="div" variant="body2" color="text.secondary">
                    Work Time
                  </Typography>
                </>
              )}
            </Box>
            <Typography component="div" variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Completed Cycles: {cycles}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
