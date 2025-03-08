const express = require('express');
const path = require('path');
const cors = require('cors');

// Import backend app
const backendApp = require('./backend/server.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Use the backend routes
app.use('/api', backendApp);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 