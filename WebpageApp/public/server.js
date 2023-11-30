// server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be saved
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Create a Multer instance with the storage engine
const upload = multer({ storage: storage });

// Configure a route to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Successfully received and saved the file
  res.status(200).send('File uploaded successfully.');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

