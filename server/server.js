const express = require('express');
const cors = require('cors');
const db = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/addresses', require('./routes/addresses'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});