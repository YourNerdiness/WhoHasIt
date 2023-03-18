const express = require("express");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const app = express();

const db = new sqlite3.Database("main-db");

db.run(`CREATE TABLE IF NOT EXISTS titles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        region TEXT NOT NULL,
        genre TEXT NOT NULL,
        netflix INTEGER NOT NULL DEFAULT 0,
        hbo INTEGER NOT NULL DEFAULT 0,
        binge INTEGER NOT NULL DEFAULT 0,
        stan INTEGER NOT NULL DEFAULT 0,
        disney INTEGER NOT NULL DEFAULT 0
);`);

app.use(express.static("public"));
app.use(express.json());

app.get("/search", (req, res) => {

    const query = req.headers.query;
    const region = req.headers.region;
    const genre = req.headers.genre;

    pool.getConnection((err, connection) => {

        if (err) throw err;

        const sql = `
            SELECT 
                name, 
                netflix, 
                hbo, 
                binge, 
                stan, 
                disney
            FROM 
                titles
            WHERE 
                LOWER(name) LIKE CONCAT("%", LOWER(?), "%") AND 
                region = ? AND 
                (genre = ? OR ? = "any")
            ORDER BY 
                CASE 
                    WHEN LOWER(name) = LOWER(?) THEN 1 
                    WHEN LOWER(name) LIKE CONCAT(LOWER(?), "%") THEN 2 
                    WHEN LOWER(name) LIKE CONCAT("% ", LOWER(?), "%") THEN 3 
                    WHEN LOWER(name) LIKE CONCAT("%", LOWER(?), "%") THEN 4 
                    ELSE 5 
                END
        `;

        db.all(sql, [query, region, genre, genre, query, query, query, query], (err, result) => {

            connection.release();

            if (err) throw err;

            res.json(result);

        });

    });

});

app.listen(3000, () => {

    console.log("Server started on port 3000");

});