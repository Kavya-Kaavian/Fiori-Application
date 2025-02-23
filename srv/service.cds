using { library } from '../db/schema';

service LibraryService {
    entity Books as projection on library.Books;
    entity MigratedBooks as projection on library.MigratedBooks;

    action migrateAllBooks(bookid:Integer) returns String;
}