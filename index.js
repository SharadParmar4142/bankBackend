const express = require('express');
const dotenv = require('dotenv').config();
const connectDb = require('./config/dbConnection');
const cors = require('cors');
// Connect to the database
connectDb();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: 'http://localhost:5173',  // Allow your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // Allow cookies and other credentials
}));

app.use(express.json());

// User routes
app.get('/', (req, res) => {
  res.send('Welcome to the admin Home Page!');
});

// User routes
app.use('/api/user', require('./routes/userRoutes'));

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));

// Start the server
app.listen(PORT, () => {
  console.log(`Listening to PORT: ${PORT}`);
});
