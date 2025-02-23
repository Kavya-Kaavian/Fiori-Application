const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    const { Books, MigratedBooks } = this.entities;

    this.on('migrateAllBooks', async (req) => {
        const { bookid } = req.data;
        if (!bookid) {
            return "Book ID is required for migration.";
        }

        try {
            const booksToMigrate = await SELECT.one.from(Books).where({ bookid });

            if (!booksToMigrate) {
                return `No book found with ID ${bookid}`;
            }

            await INSERT.into(MigratedBooks).entries({
                bookid: booksToMigrate.bookid,
                title: booksToMigrate.title,
                author: booksToMigrate.author,
                price: booksToMigrate.price,
                migratedAt: new Date()
            });

            return `Successfully migrated book with ID ${bookid}`;
        } catch (error) {
            console.error("Migration failed:", error);
            throw new Error("Data migration failed");
        }
    });
});