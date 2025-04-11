require("dotenv").config();
const path = require('path');
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// MongoDB Connection URL
const dbURL = process.env.MONGO_URL;

// Comprehensive CORS configuration
const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization'
  ],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const eventoRoutes = require("./routes/eventoRoutes");

// Use routes
app.use("/api", eventoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Route Not Found',
    path: req.path
  });
});

// MongoDB Connection
mongoose.connect(dbURL, { 
  dbName: "eventdb", // Force Mongoose to use 'eventdb'
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

module.exports = app;