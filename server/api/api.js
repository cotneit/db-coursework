const express = require('express');

const books = require('./books.route');

const router = express.Router();

router.use('/books', books);

module.exports = router;
