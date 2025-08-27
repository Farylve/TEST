const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database with retry logic
async function initDatabase(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to database... (attempt ${i + 1}/${retries})`);
      console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
      
      // Test connection first
      await pool.query('SELECT NOW()');
      console.log('Database connection successful');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          text TEXT NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Database initialized successfully');
      return; // Success, exit retry loop
    } catch (err) {
      console.error(`Database initialization error (attempt ${i + 1}/${retries}):`, err.message);
      
      if (i === retries - 1) {
        console.error('All database connection attempts failed');
        throw err; // Re-throw on final attempt
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and start server
async function startServer() {
  await initDatabase();
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio Backend API is running!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Portfolio Backend API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Health endpoint for nginx proxy (without /api prefix)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for deployment
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Portfolio Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: port
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    data: {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ]
    }
  });
});

// Database health check endpoint
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    res.json({
      status: 'OK',
      message: 'Database connection healthy',
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database health check failed:', err);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Tasks API endpoints
app.get('/api/tasks', async (req, res) => {
  try {
    console.log('Fetching tasks from database...');
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    console.log(`Found ${result.rows.length} tasks`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    console.error('Error details:', err.message);
    console.error('Error code:', err.code);
    res.status(500).json({ 
      error: 'Failed to fetch tasks',
      details: err.message 
    });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO tasks (text) VALUES ($1) RETURNING *',
      [text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    const result = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;