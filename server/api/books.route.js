const express = require('express');
const db = require('../db');

const router = express.Router();

const bookSchema = {
  id: null,
  title: null,
  author: null,
  year: null,
  description: null,
};

const quantitySchema = {
  book_id: null,
  available: null,
  sold: null,
};

const priceSchema = {
  book_id: null,
  price: null,
};

router.get('/:id', (req, res) => {
  const { id } = req.params;
  getBookById(id, (err, row) => {
    if (err) {
      console.error(err);
    }

    if (!row) {
      res.status(404).json({ error: `Book with id ${id} doesn't exist.` });
      return;
    }

    res.status(200).json(row);
  });
});

router.get('/', (req, res) => {
  getAllBooks((err, rows) => {
    if (err) {
      console.error(err);
    }

    res.status(200).json(rows);
  });
});

router.post('/', (req, res) => {
  const book = req.body;
  console.log(book);
  let isInterrupted = false;

  db.serialize();
  addBook(book, (err) => {
    if (err) {
      console.error('AddBookError', err);
      res.status(500).json({ error: 'Error occured while adding a book to the database.' });
      isInterrupted = true;
    }
    db.parallelize();
  });

  getLastAddedBookId().then((id) => {
    if (isInterrupted) return;
    updateBookQuantityById(id, book, (err) => {
      if (err) {
        console.error('UpdateQuantityErrror', err);
      }
    });

    updateBookPriceById(id, book, (err) => {
      if (err) {
        console.error('UpdatePriceErrror', err);
      }
    });

    getGenres().then((genres) => {
      updateBookGenresById(id, book, genres, (err) => {
        if (err) {
          console.error('UpdateGenresErrror', err);
        }
      });

      db.serialize();
      getBookById(id, (err, row) => {
        if (err) {
          console.error('GetBookByIdError', err);
        }

        db.parallelize();
        res.status(201).json(row);
      });
    });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const book = req.body;

  updateBookById(id, book, (err) => {
    if (err) {
      console.error(err);
    }
  });

  updateBookQuantityById(id, book, (err) => {
    if (err) {
      console.error(err);
    }
  });

  updateBookPriceById(id, book, (err) => {
    if (err) {
      console.error(err);
    }
  });

  getGenres().then((genres) => {
    updateBookGenresById(id, book, genres, (err) => {
      if (err) {
        console.error(err);
      }
    });

    db.serialize();
    getBookById(id, (err, row) => {
      if (err) {
        console.error(err);
      }

      db.parallelize();
      res.status(200).json(row);
    });
  });
});

router.delete('/:id', (req, res) => {
  deleteBookById(req.params.id, (err) => {
    if (err) {
      console.error(err);
    }
  });

  res.status(200).json(null);
});

function getPlaceholderSet(obj, schema, exclusions = [], type = 'UPDATE') {
  const columns = Array.isArray(schema) ? schema : Object.keys(schema);
  const filterPredicate = (entry) => !exclusions.includes(entry[0]) && columns.includes(entry[0]);

  const placeholderStr = Object.entries(obj)
    .filter(filterPredicate)
    .map((entry) => entry[0])
    .map((key) => {
      if (type === 'INSERT') {
        return `$${key}`;
      }

      return `${key} = $${key}`;
    })
    .join(', ');

  const placeholderObj = Object.fromEntries(
    Object.entries(obj)
      .filter(filterPredicate)
      .map((entry) => [`$${entry[0]}`, entry[1]]),
  );

  return { placeholderStr, placeholderObj };
}

function addBook(book, callback) {
  const { placeholderStr, placeholderObj } = getPlaceholderSet(book, bookSchema, ['id'], 'INSERT');

  const sql = `INSERT INTO book (title, author, year, description) VALUES (${placeholderStr})`;

  db.run(sql, placeholderObj, callback);
}

function updateBookById(id, book, callback) {
  const exclusions = ['id'];
  const { placeholderStr, placeholderObj } = getPlaceholderSet(book, bookSchema, exclusions);

  const sql = `UPDATE book SET ${placeholderStr} WHERE id = $id`;

  placeholderObj.$id = id;

  db.get(sql, placeholderObj, callback);
}

function updateBookGenresById(id, book, genres, callback) {
  if (book.genres === undefined) return;

  const deleteSql = 'DELETE FROM book_is_genre WHERE book_id = $id';

  if (book.genres === null || (Array.isArray(book.genres) && book.genres.length === 0)) {
    db.run(deleteSql, { $id: id });
    return;
  }

  const bookGenres = book.genres
    .map((genreName) => (
      [id, genres.find((genre) => genre.name === genreName)?.id]
    ))
    .filter((genre) => genre[1] !== undefined);

  const placeholderStr = bookGenres.map(() => '(?, ?)');

  const sql = `INSERT INTO book_is_genre ([book_id], [genre_id]) VALUES ${placeholderStr};`;

  const placeholderArr = bookGenres.flat();

  db.serialize(() => {
    db.run(deleteSql, { $id: id });
    if (book.genres === null) return;
    db.get(sql, placeholderArr, callback);
  });
}

function updateBookQuantityById(id, book, callback) {
  const isValidInput = Object.keys(quantitySchema).some((key) => book[key] !== undefined);
  if (!isValidInput) return;

  const { placeholderStr, placeholderObj } = getPlaceholderSet(book, quantitySchema);

  const sql = `UPDATE quantity SET ${placeholderStr} WHERE book_id = $id`;
  placeholderObj.$id = id;

  db.get(sql, placeholderObj, callback);
}

function updateBookPriceById(id, book, callback) {
  const isValidInput = Object.keys(priceSchema).some((key) => book[key] !== undefined);
  if (!isValidInput) return;

  const { placeholderStr, placeholderObj } = getPlaceholderSet(book, priceSchema);

  const sql = `UPDATE price SET ${placeholderStr} WHERE book_id = $id`;
  placeholderObj.$id = id;

  db.get(sql, placeholderObj, callback);
}

function getBookById(id, callback) {
  const sql = `
  SELECT
  book.id
  ,book.title
  ,book.author
  ,book.year
  ,book.description
  ,genres
  ,quantity.available
  ,quantity.sold
  ,price.price
FROM book
LEFT JOIN quantity
ON book.id = quantity.book_id
LEFT JOIN price
ON book.id = price.book_id
LEFT JOIN (
  SELECT
    book_id
    ,json_group_array(genre.name) AS genres
  FROM book_is_genre
  LEFT JOIN genre
  ON book_is_genre.genre_id = genre.id
  GROUP BY book_id
) AS book_genres
ON book_genres.book_id = book.id
WHERE book.id = $id;`;

  const params = {
    $id: id,
  };

  db.get(sql, params, (err, row) => {
    if (row) {
      row.genres = JSON.parse(row.genres);
    }

    callback(err, row);
  });
}

function getAllBooks(callback) {
  const sql = `
  SELECT
  book.id
  ,book.title
  ,book.author
  ,book.year
  ,book.description
  ,genres
  ,quantity.available
  ,quantity.sold
  ,price.price
FROM book
LEFT JOIN quantity
ON book.id = quantity.book_id
LEFT JOIN price
ON book.id = price.book_id
LEFT JOIN (
  SELECT
    book_id
    ,json_group_array(genre.name) AS genres
  FROM book_is_genre
  LEFT JOIN genre
  ON book_is_genre.genre_id = genre.id
  GROUP BY book_id
) AS book_genres
ON book_genres.book_id = book.id;`;

  db.all(sql, (err, rows) => {
    rows.forEach((row) => {
      if (!row.genres) {
        return;
      }

      row.genres = JSON.parse(row.genres);
    });

    callback(err, rows);
  });
}

function getLastAddedBookId() {
  const sql = 'SELECT last_insert_rowid() AS id';

  return new Promise((resolve) => {
    db.get(sql, (err, row) => {
      if (err) {
        throw err;
      }

      resolve(row.id);
    });
  });
}

function deleteBookById(id, callback) {
  const sql = 'DELETE FROM book WHERE id = $id';
  const params = {
    $id: id,
  };

  db.run(sql, params, callback);
}

function getGenres() {
  const sql = 'SELECT * FROM genre;';

  return new Promise((resolve) => {
    db.all(sql, (err, rows) => {
      if (err) {
        throw err;
      }

      resolve(rows);
    });
  });
}

module.exports = router;
