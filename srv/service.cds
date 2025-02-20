using { library } from '../db/schema';

service LibraryService {
    entity Books as projection on library.Books;
}