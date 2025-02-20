namespace library;

entity Books{
    key bookid:Integer;
    title: String;
    author: String;
    status: String;
}
entity MigratedBooks {
    key bookid: Integer;
    title: String;
    author: String;
    status: String;
    migratedAt: Timestamp;
}