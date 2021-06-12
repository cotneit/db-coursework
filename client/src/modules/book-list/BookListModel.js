const API_ROOT = '/api';

export default class BookListModel {
  constructor() {
    this.books = [];
    this.updateBooks();
    this.onBooksUpdated = () => {};
  }

  updateBooks() {
    this.constructor.getBooks()
      .then((books) => {
        console.log(books);
        this.books = books;
        this.onBooksUpdated(books);
      });
  }

  static getBooks() {
    return fetch(`${API_ROOT}/books`)
      .then((res) => res.json());
  }

  static getBookById(id) {
    return fetch(`${API_ROOT}/books/${id}`)
      .then((res) => res.json());
  }

  addBook(book) {
    return fetch(`${API_ROOT}/books`, {
      method: 'POST',
      body: JSON.stringify(book),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      this.updateBooks();
      res.json();
    });
  }

  deleteBookById(id) {
    return fetch(`${API_ROOT}/books/${id}`, { method: 'DELETE' })
      .then((res) => {
        this.updateBooks();
        res.json();
      });
  }

  editBookById(id, book) {
    return fetch(`${API_ROOT}/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      this.updateBooks();
      res.json();
    });
  }
}
