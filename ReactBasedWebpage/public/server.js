// server.js
//This is Nodejs Custom Server. 
//It handles gpx uploads using a predefined variable named port.
//Jan Baraniecki


const http = require('http');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const port = 4000;

//Server Sets up Storage Space and Recieve Files/////////////////////////////////////////////////////////////////
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be saved
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    cb(null, file.originalname);
  },
});


// Create a Multer instance with the storage engine
const upload = multer({ storage: storage });

// Configure a route to handle file uploads
app.post('/upload', upload.single('gpxFile'), (req, res) => {
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



//Server Sends GPX Files to the Client/////////////////////////////////////////////////////////////////////////////////////
// Endpoint to list all files in 'uploads' directory
app.get('/files', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      res.status(500).send('Error reading files.');
    } else {
      res.status(200).json(files);
    }
  });
});

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));