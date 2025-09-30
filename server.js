require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Email = require('./Email');
const Carer = require('./Carer') // handler we'll create next

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' })); // open for dev/test. Lock this down in prod.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger for every request
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url, req.body || {});
  next();
});

// Test route
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.send('Backend is working!');
});

// Contact route (uses Email.js)
app.post('/api/contact', Email);
app.post('/api/carrer', Carer);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
