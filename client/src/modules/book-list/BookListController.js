export default class BookListController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.onBooksUpdated = this.onBooksUpdated.bind(this);
    this.view.onBookEdited = this.onBookEdited.bind(this);
    this.view.onBookDeleted = this.onBookDeleted.bind(this);
    this.view.onBookAdded = this.onBookAdded.bind(this);
  }

  onBooksUpdated(books) {
    this.view.populateTable(books);
  }

  onBookEdited(bookId, book) {
    return this.model.editBookById(bookId, book);
  }

  onBookDeleted(bookId) {
    return this.model.deleteBookById(bookId);
  }

  onBookAdded(book) {
    return this.model.addBook(book);
  }
}
