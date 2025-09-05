const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - serve the test menu
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-menu.html'));
});

// API endpoint to handle form submissions (for testing)
app.post('/api/submit', (req, res) => {
  res.json({
    success: true,
    message: 'Form data received successfully',
    data: req.body,
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  // Server started successfully on port 3001
});
