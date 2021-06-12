const express = require('express');
const cors = require('cors');
require('dotenv').config();

const api = require('./api/api');

const app = express();
const PORT = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));
app.use('/api', api);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
