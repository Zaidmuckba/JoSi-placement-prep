'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tab,
  Tabs,
} from '@mui/material';
import PomodoroTimer from '../components/tools/PomodoroTimer';
import TodoList from '../components/tools/TodoList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tools-tabpanel-${index}`}
      aria-labelledby={`tools-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ToolsPage() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Productivity Tools
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="tools tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Pomodoro Timer" />
            <Tab label="Task Manager" />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={6}>
              <PomodoroTimer />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
              <TodoList />
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
}
