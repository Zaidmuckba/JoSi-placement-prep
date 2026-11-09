'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  List,
  ListItem,
  IconButton,
  Checkbox,
  Stack,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: 'Interview' | 'Resume' | 'Application' | 'General';
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [category, setCategory] = useState<Todo['category']>('General');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        category
      }
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);
  };

  const getCategoryColor = (category: Todo['category']) => {
    switch (category) {
      case 'Interview':
        return 'primary';
      case 'Resume':
        return 'secondary';
      case 'Application':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ maxWidth: 600, m: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Task Manager
        </Typography>

        <form onSubmit={addTodo}>
          <Stack direction="row" spacing={1} mb={2}>
            <TextField
              fullWidth
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              size="small"
            />
            <Box display="flex" gap={1}>
              {(['Interview', 'Resume', 'Application', 'General'] as const).map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setCategory(cat)}
                  color={category === cat ? getCategoryColor(cat) : 'default'}
                  variant={category === cat ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Stack>
        </form>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <List
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ minHeight: '50px' }}
              >
                {todos.map((todo, index) => (
                  <Draggable 
                    key={todo.id} 
                    draggableId={todo.id} 
                    index={index}
                  >
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          bgcolor: 'background.paper',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box 
                          {...provided.dragHandleProps}
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'grab',
                            mr: 1
                          }}
                        >
                          <DragIcon sx={{ color: 'text.secondary' }} />
                        </Box>
                        <Checkbox
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                        />
                        <Box flexGrow={1}>
                          <Typography
                            component="div"
                            sx={{
                              textDecoration: todo.completed ? 'line-through' : 'none',
                            }}
                          >
                            {todo.text}
                          </Typography>
                        </Box>
                        <Chip
                          label={todo.category}
                          size="small"
                          color={getCategoryColor(todo.category)}
                          sx={{ mr: 1 }}
                        />
                        <IconButton
                          edge="end"
                          onClick={() => deleteTodo(todo.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
