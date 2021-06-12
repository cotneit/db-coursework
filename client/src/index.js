import './css/main.css';

import BookListView from './modules/book-list/BookListView';
import BookListController from './modules/book-list/BookListController';
import BookListModel from './modules/book-list/BookListModel';

const root = document.body;

const controller = new BookListController(new BookListModel(), new BookListView(root));
