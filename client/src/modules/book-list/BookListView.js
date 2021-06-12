export default class BookListView {
  constructor(parent) {
    this.parent = parent;
    this.headers = [
      'Id',
      'Title',
      'Author',
      'Year',
      'Description',
      'Genres',
      'Available',
      'Sold',
      'Price',
      'Controls',
    ];

    this.cellOrder = [
      'id',
      'title',
      'author',
      'year',
      'description',
      'genres',
      'available',
      'sold',
      'price',
    ];

    this.spinner = createSpinner();
    this.createTable();
    parent.append(this.table);

    this.placeholderBook = {
      id: null,
      title: null,
      author: null,
      year: null,
      description: 'By editing and saving this row you can add books. Id will be generated automatically.',
      genres: null,
      available: null,
      sold: null,
      price: null,
    };

    this.onBookEdited = () => {};
    this.onBookDeleted = () => {};
    this.onBookAdded = () => {};
  }

  createTable() {
    this.table = createElement('table', 'book-table');
    this.thead = createElement('thead');
    this.tbody = createElement('tbody');

    this.createHeaderRow();
    this.thead.append(this.headerRow);

    this.table.append(this.thead, this.tbody);
  }

  createHeaderRow() {
    this.headerRow = document.createElement('tr');

    this.headers.forEach((header) => {
      const td = document.createElement('th');
      td.textContent = header;
      this.headerRow.append(td);
    });

    return this.headerRow;
  }

  populateTable(books) {
    const rows = document.createDocumentFragment();

    const placeholderBookRow = this.createBookRow(this.placeholderBook);
    rows.append(placeholderBookRow);

    books.forEach((book) => {
      const tr = this.createBookRow(book);
      rows.append(tr);
    });

    this.tbody.innerHTML = '';
    this.tbody.append(rows);
  }

  createBookRow(book) {
    const tr = document.createElement('tr');
    const entries = Object.entries(book);
    const bookId = book.id;

    entries.forEach((entry) => {
      const [key, value] = entry;
      const td = createElement('td');

      switch (key) {
        case 'description': {
          const container = createElement('div', 'book-table__book-description');
          container.textContent = value;
          td.append(container);
          break;
        }
        case 'price': {
          td.textContent = value ? `$${value}` : 'Not specified';
          break;
        }
        case 'genres': {
          td.textContent = value ? value.join(', ') : '';
          break;
        }
        default: {
          td.textContent = value;
        }
      }

      tr.append(td);
    });

    /* Control handling */
    const editableCells = [...tr.children];
    const controlsCell = document.createElement('td');

    const buttons = Array(5).fill().map(() => (
      document.createElement('button')
    ));

    const [editBtn, cancelBtn, saveBtn, deleteBtn, confirmBtn] = buttons;
    editBtn.textContent = 'Edit';
    cancelBtn.textContent = 'Cancel';
    saveBtn.textContent = 'Save';
    deleteBtn.textContent = 'Delete';
    confirmBtn.textContent = 'Yes';

    setStyles([cancelBtn, confirmBtn, saveBtn], 'display', 'none');

    const confirmText = document.createElement('div');
    confirmText.textContent = 'You sure about that?';
    confirmText.hidden = true;

    let confirmFunction = null;

    editBtn.addEventListener('click', () => {
      editableCells.forEach((cell) => {
        cell.contentEditable = true;
      });

      setStyles([editBtn, deleteBtn], 'display', 'none');
      setStyles([cancelBtn, saveBtn], 'display', 'inline');
    });

    cancelBtn.addEventListener('click', () => {
      tr.replaceWith(this.createBookRow(book));
    });

    saveBtn.addEventListener('click', () => {
      const newBook = Object.create(book);

      editableCells.forEach((cell, i) => {
        cell.contentEditable = false;
        newBook[this.cellOrder[i]] = this.extractDataFromCell(cell, i);
      });

      console.log(newBook);

      confirmFunction = () => {
        this.spinner.toggle();
        (() => {
          if (bookId === null) {
            return this.onBookAdded(newBook);
          }

          return this.onBookEdited(bookId, newBook);
        })().finally(() => {
          this.spinner.toggle();
        });
      };

      setStyles([
        [confirmText, 'display', 'block'],
        [saveBtn, 'display', 'none'],
        [confirmBtn, 'display', 'inline'],
      ]);
    });

    deleteBtn.addEventListener('click', () => {
      confirmFunction = () => {
        this.spinner.toggle();
        this.onBookDeleted(bookId)
          .then(() => {
            tr.remove();
          })
          .finally(() => {
            this.spinner.toggle();
          });
      };

      setStyles([editBtn, deleteBtn], 'display', 'none');
      setStyles([cancelBtn, confirmBtn], 'display', 'inline');
      setStyles([confirmText], 'display', 'block');
    });

    confirmBtn.addEventListener('click', () => {
      confirmFunction();
      confirmFunction = null;

      setStyles([confirmText, confirmBtn, cancelBtn], 'display', 'none');
      setStyles([editBtn, deleteBtn], 'display', 'inline');
    });

    controlsCell.append(confirmText, editBtn, cancelBtn, confirmBtn, deleteBtn, saveBtn);
    tr.append(controlsCell);
    /* End Control handling */

    return tr;
  }

  extractDataFromCell(cell, indexInCellOrder) {
    const cellType = this.cellOrder[indexInCellOrder];

    switch (cellType) {
      case 'year':
      case 'sold':
      case 'available': {
        return Number(cell.textContent);
      }
      case 'genres': {
        const genresStr = cell.textContent;
        const genres = genresStr.split(/,\s{0,}/).filter((genre) => genre !== '').map(capitalize);
        return genres;
      }
      case 'price': {
        const text = cell.textContent;
        return text[0] === '$' ? Number(text.slice(1)) : Number(text);
      }
      default: {
        return cell.textContent;
      }
    }
  }
}

function createElement(tag, className) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  return element;
}

function setStyles(queries, defaultStyle, defaultValue) {
  queries.forEach((query) => {
    let element; let style; let value;

    if (Array.isArray(query)) {
      [element, style, value] = query;
    } else {
      [element, style, value] = [query, defaultStyle, defaultValue];
    }

    element.style[style] = value;
  });
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function createSpinner() {
  const NUMBER_OF_CIRCLES = 12;
  const spinnerContainer = document.createElement('div');
  spinnerContainer.className = 'spinner-container';

  const spinner = document.createElement('div');
  spinner.className = 'lds-default';

  for (let i = 0; i < NUMBER_OF_CIRCLES; i += 1) {
    const circle = document.createElement('div');
    spinner.append(circle);
  }

  spinnerContainer.toggle = () => {
    spinnerContainer.style.display = spinnerContainer.style.display === 'none' ? 'flex' : 'none';
  };

  spinnerContainer.style.display = 'none';
  spinnerContainer.append(spinner);

  return spinnerContainer;
}
