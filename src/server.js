const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoute = require('./routes/auth');
const dataRoute = require('./routes/data');
const createRoute = require('./routes/create');

dotenv.config();

const app = express();
const port = process.env.PORT || 5555;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Route Middlewares
app.use('/api/auth', authRoute);
app.use('/api/data', dataRoute);
app.use('/api/create', createRoute);

app.listen(port, () => console.log('Server running at port %d.', port));
