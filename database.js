const sqlite = require("sqlite3").verbose();
const md5 = require("md5");

const DB_SOURCE = "db.sqlite";

let db_connection = new sqlite.Database(DB_SOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db_connection.run(
      `CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
      (err) => {
        if (err) {
          
        } else {
          // Table just created, creating some rows
          const insert =
            "INSERT INTO user (name, email, password) VALUES (?,?,?)";
          db_connection.run(insert, [
            "admin",
            "admin@example.com",
            md5("admin123456"),
          ]);
          db_connection.run(insert, [
            "user",
            "user@example.com",
            md5("user123456"),
          ]);
        }
      }
    );
  }
});

module.exports = db_connection
